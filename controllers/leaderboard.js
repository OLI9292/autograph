const mongoose = require('mongoose');
const _ = require("underscore");

const cache = require("../cache");
const School = require("../models/school");
const User = require("../models/user");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

const ranksFor = (userDocs, isWeekly, isClass) => {
  const fullName = (first, last) => last ? `${first} ${last}` : first;

  let ranks = _.map(userDocs, user => ({
    userId: user._id,
    name: fullName(user.firstName, user.lastName),
    points: isWeekly ? user.weeklyStarCount : user.totalStarCount,
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

  return _.union(
    ranksFor(students, true, true),
    ranksFor(students, false, true)
  );
}

const worldRanks = async () => {
  try {
    let students = await User.find(
      { isTeacher: false },
      { weeklyStarCount: 1, totalStarCount: 1, firstName: 1, lastName: 1 }
    );

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
    return _.union(
      filter(weekly, "userId", userId),
      filter(allTime, "userId", userId)
    );
  } else {
    return _.union(
      isWeekly ? filter(weekly, "position", position) : [],
      isWeekly ? [] : filter(allTime, "position", position)
    );    
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
  } else if (classId) {
    ranks = await classRanks(req.query.classId);
    return ranks.error
      ? res.status(404).send({ error: ranks.error })
      : res.status(200).send(ranks);    
  } else {
    cache.get("ranks", async (error, reply) => {
      if (error) {
        next();
      } else if (reply) {
        return res.status(200).send(filterRanks(
          JSON.parse(reply), 
          mongoose.Types.ObjectId(userId),
          (parseInt(position, 10) || 1),
          isWeekly
        ));
      } else {
        return res.status(404).send({ error: "Not found." });
      }
    });    
  }
};
