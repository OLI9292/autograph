const jwt = require("jwt-simple");
const mongoose = require("mongoose");
const _ = require("underscore");
const sumBy = require("lodash/sumBy");

const Class = require("../models/class");
const School = require("../models/school");
const Level = require("../models/level");
const User = require("../models/user");

const { login } = require("./login");
const recordEvent = require("../middlewares/recordEvent");
const cache = require("../cache");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const data = req.body;

  if (_.isArray(data)) {
    const results = await Promise.all(data.map(createUser));
    return res.status(201).send(results);
  } else {
    const response = await createUser(data);

    if (response.error) {
      return res.status(422).send(response);
    }

    return req.query.login
      ? login(req.body.email, req.body.password, result => res.status(result.error ? 422 : 201).send(result))
      : res.status(201).send(response);
  }
};

const createUser = async data => {
  try {
    const existing = await User.findOne({ email: data.email });
    if (existing) { return { error: "There is already an account associated with this email." }; }

    const user = new User(data);
    await user.save();

    // For Spring Competition growth test
    if (data.referrer) {
      User.findByIdAndUpdate(data.referrer, { inSpringCompetition: true }, (error, res) => {
        if (!error) { console.log(data.email + " was signed up by " + data.referrer)}
      });
    }

    return user;
  } catch (error) {
    return { error: error.message };
  }
};

//
// READ
//

const userIdQuery = query => {
  return _.has(query, "facebookId")
    ? { facebookId: query.facebookId }
    : _.has(query, "email") ? { email: query.email } : null;
};

exports.read = async (req, res, next) => {
  if (req.params.id) {
    recordEvent(req.userId, req.sessionId, req.ip, req.path);

    User.findById(req.params.id, async (error, user) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(user);
    });

  } else if (req.query.inSpringCompetition) {
    
    User.find({ inSpringCompetition: true }, { firstName: 1, lastName: 1, nameOfSchool: 1 }, (error, users) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(users);
    });

  } else if (!_.isEmpty(req.query)) {
    
    const query = userIdQuery(req.query);

    if (query) {
      User.findOne(query, async (error, user) => {
        if (error) {
          return res.status(422).send({ error: error.message });
        }

        return user
          ? res.status(200).send({ success: true, user: user })
          : res.status(404).send({ error: "Not found." });
      });
    } else {
      return res.status(422).send({ error: "Unsupported user query." });
    }

  } else {

    User.find({}, (error, users) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(users);
    });

  }
};

//
// UPDATE
//

exports.completedLevel = async (req, res, next) => {
  const { levelId, stage, accuracy, time, score, type } = req.body;

  User.findById(req.params.id, async (error, user) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }
    if (!user) {
      return res.status(422).send({ error: "User not found." });
    }

    Level.findById(levelId, async (error, level) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }
      if (!level) {
        return res.status(422).send({ error: "Level not found." });
      }

      const userLevelIdx = _.findIndex(user.levels, l =>
        l.id.equals(level._id)
      );

      const userStageIdx =
        userLevelIdx > -1 &&
        _.findIndex(user.levels[userLevelIdx].progress, p => p.stage === stage);

      if (userLevelIdx > -1 && userStageIdx > -1) {
        // updates a previously played stage
        const userStage = user.levels[userLevelIdx].progress[userStageIdx];
        user.levels[userLevelIdx].progress[userStageIdx] = {
          stage: stage,
          type: type,
          bestTime: Math.min(time, userStage.bestTime),
          bestAccuracy: Math.max(accuracy, userStage.bestAccuracy),
          bestScore: Math.max(score, userStage.bestScore)
        };
      } else {
        const progress = {
          stage: stage,
          type: type,
          bestTime: time,
          bestAccuracy: accuracy,
          bestScore: score
        };
        if (userLevelIdx > -1) {
          // creates a new stage for a previously played level
          user.levels[userLevelIdx].progress.push(progress);
        } else {
          // creates a new stage for a new level
          user.levels.push({ id: level._id, progress: progress });
        }
      }

      try {
        await user.save();
        return res.status(200).send(user);
      } catch (error) {
        return res.status(422).send({ error: error.message });
      }
    });
  });
};

exports.update2 = async (req, res, next) => {
  User.update({ _id: req.params.id }, req.body, async (error, result) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return result.n > 0
      ? res.status(200).send(req.body)
      : res.status(404).send({ error: "Not found." });
  });
};

exports.update = async (req, res, next) => {
  if (req.body.platform === "web") {
    recordEvent(req.userId, req.sessionId, req.ip, req.path);
    return await updateFromWeb(req, res, next);
  } else {
    return await updateFromMobile(req, res, next);
  }
};

const updateFromWeb = async (req, res, next) => {
  const {
    id,
    stats,
    elo
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) { return res.status(422).send({ error: "User not found." }) }

    // Update user word list
    _.forEach(stats, stat => {
      const index = _.findIndex(user.words, word => stat.word === word.name);

      if (index > -1) {
        const copy = user.words[index];
        copy.seen += 1;
        copy.correct += stat.correct ? 1 : 0;
        copy.experience = Math.min(
          10,
          stat.correct ? copy.experience + 1 : copy.experience
        );
        copy.timeSpent += stat.time || 0;      
        user.words[index] = copy;  
      } else {
        user.words.push({ 
          name: stat.word,
          correct: stat.correct ? 1 : 0,
          timeSpent: stat.time
        });        
      }
    });

    // Update other attributes
    const newTotalStarCount = user.starCount();    
    user.weeklyStarCount = user.weeklyStarCount + newTotalStarCount - user.totalStarCount;
    user.totalStarCount = newTotalStarCount;
    user.totalWordsLearned = user.words.length;
    user.totalTimeSpent = sumBy(user.words, "timeSpent");

    if (elo) { user.elo = elo };

    // Save scores
    cache.zadd(['weekly_leaderboard', user.weeklyStarCount, user._id.toString()]);
    cache.zadd(['all_time_leaderboard', user.totalStarCount, user._id.toString()]);

    await user.save();
    return res.status(200).send(user);
  } catch (error) {
    return res.status(422).send({ error: error.message })
  };
};

const updateFromMobile = async (req, res, next) => {
  const keys = ["name", "correct", "seen", "experience", "timeSpent"];
  let wordExperience = req.body.wordExperience;
  wordExperience = wordExperience.filter(e =>
    _.isEqual(_.sortBy(keys), _.sortBy(_.keys(e)))
  );
  const query = userIdQuery(req.query);

  if (query && !_.isEmpty(wordExperience)) {
    User.findOne(query, async (err, user) => {
      if (err) {
        return res
          .status(422)
          .send({ error: `Error retrieving user -> ${err.message}` });
      } else if (user) {
        if (wordExperience.length >= user.words.length) {
          user.words = wordExperience;
        }
        try {
          const users = await User.aggregate([
            { $project: { _id: 1, words: 1, length: { $size: "$words" } } },
            { $sort: { length: -1 } }
          ]);
          const ranking = _.findIndex(users, u => user._id.equals(u._id));
          if (ranking >= 0) {
            user.ranking = ranking + 1;
          }
          await user.save();
          return res.status(201).send({ success: true, user: user });
        } catch (e) {
          return res
            .status(422)
            .send({ error: "Error saving word experience" });
        }
      }
      return res.status(404).send({ error: "Not found." });
    });
  } else {
    return res.status(422).send({ error: "Unsupported user query" });
  }
};

exports.joinClass = async (req, res, next) => {
  const [classId, students] = [req.body.classId, req.body.students];

  if (!classId || !_.isArray(students)) {
    return res.status(422).send({ error: "Invalid query." });
  }

  await Class.findById(classId, (err, _class) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }
    if (_class) {
      return res.status(404).send({ error: "Not found." });
    }

    User.find({ _id: { $in: students } }, async (err, students) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      const newStudents = _.reject(students, s =>
        _class.students.some(o => o.equals(s._id))
      );

      await newStudents.forEach(async n => {
        if (!_.some(n.classes, c => c.equals(classId))) {
          n.classes.push({ id: classId, role: "student" });
          await n.save();
        }
      });

      _.pluck(newStudents, "_id").forEach(id => _class.students.push(id));

      await _class.save();
      return res.status(200).send(_class);
    });
  });
};

exports.joinSchool = async (req, res, next) => {
  const [schoolId, users] = [req.body.school, req.body.users];

  if (!schoolId || !_.isArray(users)) {
    return res.status(422).send({ error: "Invalid params." });
  }

  School.findById(schoolId, async (error, school) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }
    if (!school) {
      return res.status(404).send({ error: "Not found." });
    }

    User.updateMany(
      { _id: { $in: users } },
      { $set: { school: school._id } },
      async (error, users) => {
        return error
          ? res.status(422).send({ error: error.message })
          : res.status(200).send({ success: true });
      }
    );
  });
};

exports.resetStarCounts = async (req, res, next) => {
  User.updateMany(
    {},
    { $set: { weeklyStarCount: 0 } },
    async (error, users) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send({ success: true });
    }
  );
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  User.findOneAndRemove({ _id: req.params.id }, async (error, user) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(200).send(user);
  });
};

//
// LOGIN
//

const expiresIn = numDays => {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
};

const genToken = user => {
  const expires = expiresIn(7);
  const token = jwt.encode({ exp: expires }, process.env.VALIDATION_TOKEN);
  return { user: user._id, expires: expires, token: token };
};

exports.login = async (req, res, next) => {
  const data = req.body;

  try {
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (user) {
      user.comparePassword(data.password, function(error, isMatch) {
        let result, statusCode;

        if (error) {
          statusCode = 422;
          result = { error: "Something went wrong." };
        } else if (isMatch) {
          statusCode = 201;
          result = { user: user, success: true, token: genToken(user) };
        } else {
          statusCode = 422;
          result = { error: "Incorrect password." };
        }

        return res.status(statusCode).send(result);
      });
    } else {
      return res.status(404).send({ error: "Email not found." });
    }
  } catch (error) {
    return res.status(422).send({ error: "Error finding user." });
  }
};
