const _ = require("underscore");

const cache = require("../cache");
const School = require("../models/school");
const User = require("../models/user");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

const ranksFor = (userDocs, isWeekly, isClass) => {
  let ranks = _.map(userDocs, user => ({
    userId: user._id,
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
  let { weekly, allTime } = ranks;
  if (userId) {
    const weeklyUserIdx = _.findIndex(weekly, rank => rank.userId === userId);
    const allTimeUserIdx = _.findIndex(allTime, rank => rank.userId === userId);
    weekly = weeklyUserIdx ? weekly.slice(weeklyUserIdx, weeklyUserIdx + 20) : [];
    allTime = allTimeUserIdx ? allTime.slice(allTimeUserIdx, allTimeUserIdx + 20) : [];
    return { weekly: weekly, allTime: allTime };
  } else {
    ranks = isWeekly ? weekly : allTime;
    const index = _.findIndex(allTime, rank => rank.position === position);
    ranks = index ? ranks.slice(index, index + 20) : [];
    return { weekly: isWeekly ? ranks : weekly, allTime: isWeekly ? allTime : ranks };
  }
}

exports.read = async (req, res, next) => {
  recordEvent(req.userId, req.sessionId, req.ip, req.path);

  const {
    classId,
    userId,
    position,
    weekly
  } = req.query;

  if (req.query.classId) {
    ranks = await classRanks(req.query.classId);
  } else {
    ranks = await worldRanks();
    ranks = filterRanks(ranks, userId, position, weekly);
  }

  ranks = _.flatten(_.values(ranks));

  return ranks.error
    ? res.status(404).send({ error: error })
    : res.status(200).send(ranks);

    /*cache.get("leaderboards", async (error, reply) => {
      if (error) {
        next();
      } else if (reply) {
        let ranks = JSON.parse(reply).ranks;

        if (req.query) {
          ranks = filterRanks(ranks, req.query);
        }

        return res.status(200).send(ranks);
      } else {
        return res.status(404).send({ error: "Not found." });
      }
    });*/
};
