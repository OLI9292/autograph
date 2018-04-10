const _ = require("underscore");

const cache = require("../cache");
const School = require("../models/school");
const User = require("../models/user");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

const ranksFor = (userDocs, isWeekly, isClass) => {
  let ranks = _.map(userDocs, user => ({
    userId: user._id.toString(),
    name: user.fullName(),
    points: isWeekly ? user.weeklyStarCount : user.starCount(),
    isWeekly: isWeekly,
    isClass: isClass
  }));

  if (!isClass) { ranks = _.filter(ranks, rank => rank.points > 0); }
  ranks = _.sortBy(ranks, rank => -rank.points)
  ranks = _.map(ranks, (rank, idx) => _.extend({}, rank, { position: idx + 1 }));

  return ranks;
}

const classRanks = async classId => {
  const _class = await Class.findById(classId);
  if (!_class) { return { error: "Class not found." }; }
  const students = await _class.studentDocs();
  if (students.error) { return { error: error.message }; }

  return {
    weekly: ranksFor(students, true, true),
    allTime: ranksFor(students, false, true)
  };
}

const worldRanks = async () => {
  try {
    const students = await User.find({ isTeacher: false });
    return {
      weekly: ranksFor(students, true, false),
      allTime: ranksFor(students, false, false)
    };
  } catch (error) {
    return { error: error.message };
  }
}

const filterRanks = (ranks, userId, position, isWeekly) => {
  const filter = (ranks, attr, value) => {
    const index = _.findIndex(ranks, rank => rank[attr] === value);
    return index ? ranks.slice(index, index + 20) : [];
  };

  let {
    weekly,
    allTime
  } = ranks;
  
  if (userId) {
    return {
      weekly: filter(weekly, "userId", userId),
      allTime: filter(allTime, "userId", userId)
    };
  } else {
    return {
      weekly: isWeekly ? filter(weekly, "position", position) : [],
      allTime: isWeekly ? [] : filter(allTime, "position", position)
    };    
  }
}

exports.read = async (req, res, next) => {
  recordEvent(req.userId, req.sessionId, req.ip, req.path);

  let {
    classId,
    userId,
    position,
    isWeekly,
    save
  } = req.query;

  let ranks;

  if (save) {
    ranks = await worldRanks();
    if (ranks.error) { return res.status(422).send({ error: error }); }
    const stringified = JSON.stringify(ranks);
    await cache.set("ranks", stringified);
    console.log("Cached ranks.");
    return res.status(200).send({ success: true });
  } else if (req.query.classId) {
    ranks = await classRanks(req.query.classId);
    return ranks.error
      ? res.status(404).send({ error: error })
      : res.status(200).send(ranks);    
  } else {
    cache.get("ranks", async (error, reply) => {
      if (error) {
        next();
      } else if (reply) {
        ranks = JSON.parse(reply);
        ranks = filterRanks(ranks, userId, (parseInt(position, 10) || 1), isWeekly);
        return res.status(200).send(ranks);
      } else {
        return res.status(404).send({ error: "Not found." });
      }
    });    
  }
};
