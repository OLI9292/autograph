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
    userId: user._id.toString(),
    name: fullName(user.firstName, user.lastName),
    points: isWeekly ? user.weeklyStarCount : user.totalStarCount,
    school: user.nameOfSchool,
    isWeekly: isWeekly,
    isClass: isClass
  }));

  if (!isClass) { ranks = _.filter(ranks, rank => rank.points > 0); }
  ranks = _.sortBy(ranks, rank => -rank.points)
  ranks = _.map(ranks, (rank, idx) => _.extend({}, rank, { position: idx + 1 }));
  ranks[ranks.length - 1].isLast = true;

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
      { weeklyStarCount: 1, totalStarCount: 1, firstName: 1, lastName: 1, nameOfSchool: 1 }
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
    return index > -1 ? ranks.slice(index, index + 20) : [];
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

exports.saveRanks = async () => {
  const ranks = await worldRanks();
  if (ranks.error) { return { error: error }; }
  const stringified = JSON.stringify(ranks);
  await cache.set("ranks", stringified);
  console.log("Cached ranks.");
  return { success: true };
}

const cachedWorldRanks = async (next, cb) => {
  cache.get("ranks", (error, reply) => {
    error 
      ? next()
      : cb(reply ? JSON.parse(reply) : { error: "Not found." });
  });      
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

  if (save) {
    
    const result = await exports.saveRanks();
    return res.status(result.error ? 422 : 200).send(result)
  
  } else if (classId && userId) {

    await cachedWorldRanks(next, async ranksWorld => {
      if (ranksWorld.error) { return res.status(422).send({ error: ranksWorld.error }); }
      const ranksClass = await classRanks(classId);
      if (ranksClass.error) { return res.status(422).send({ error: ranksClass.error }); }
      const positions = _.filter(_.union(ranksClass, ..._.values(ranksWorld)), r => r.userId === userId);
      return res.status(200).send(positions);
    });

  } else if (classId) {

    const ranks = await classRanks(classId);
    return ranks.error
      ? res.status(404).send({ error: ranks.error })
      : res.status(200).send(ranks);    

  } else {

    await cachedWorldRanks(next, response => response.error
      ? res.status(422).send({ error: response.error })
      : res.status(200).send(filterRanks(response, userId, (parseInt(position, 10) || 1), isWeekly)));

  }
};
