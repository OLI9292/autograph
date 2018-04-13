const mongoose = require('mongoose');
const _ = require("underscore");
const get = require("lodash/get");

const cache = require("../cache");
const User = require("../models/user");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

const WEEKLY_LEADERBOARD = "weekly_leaderboard";
const ALL_TIME_LEADERBOARD = "all_time_leaderboard";

const RANKS_QUERY_COUNT = 20;

const saveCurrentRanks = async cb => {
  const users = await User.find(
    { isTeacher: false },
    { _id: 1, weeklyStarCount: 1, totalStarCount: 1 }
  );

  let [ weeklyRanks, allTimeRanks ] = _.map(["weeklyStarCount", "totalStarCount"], attr => {
    return _.flatten(_.map(users, user => [ user[attr], user._id.toString() ]))
  });

  weeklyRanks.unshift(WEEKLY_LEADERBOARD);
  allTimeRanks.unshift(ALL_TIME_LEADERBOARD);

  cache.zadd(weeklyRanks, (error1, response1) => {
    cache.zadd(allTimeRanks, (error2, response2) => {
      cb({
        weekly: error1 || `Added ${response1} ranks.`,
        allTime: error2 || `Added ${response2} ranks.`
      });
    });
  });  
}

const ranksAroundUser = (userId, onlyUser, cb) => {
  const weeklyQuery = [WEEKLY_LEADERBOARD, userId];
  const allTimeQuery = [ALL_TIME_LEADERBOARD, userId];

  cache.zrevrank(weeklyQuery, (error, weeklyRank) => {
    if (error) { return cb({ error: error.message }); }

    cache.zrevrank(allTimeQuery, (error, allTimeRank) => {
      if (error) { return cb({ error: error.message }); }
      if (onlyUser) { return cb({ weeklyEarth: weeklyRank, allTimeEarth: allTimeRank }); }

      ranksForRange(weeklyRank, allTimeRank, response => cb(response));
    });
  });  
}

const ranksForRange = async (weeklyRank, allTimeRank, cb) => {
  const weeklyRangeQuery = [WEEKLY_LEADERBOARD, weeklyRank, weeklyRank + RANKS_QUERY_COUNT];
  const allTimeRangeQuery = [ALL_TIME_LEADERBOARD, allTimeRank, allTimeRank + RANKS_QUERY_COUNT];

  cache.zrevrange(weeklyRangeQuery, async (error, weeklyRanks) => {
    if (error) { return cb({ error: error.message }); }

    cache.zrevrange(allTimeRangeQuery, async (error, allTimeRanks) => {
      if (error) { return cb({ error: error.message }); }

      const userDocs = await usersForIds(_.union(weeklyRanks, allTimeRanks));

      weeklyRanks = _.map(weeklyRanks, (userId, idx) => addAttributesToRank(userId, weeklyRank + idx, true, userDocs));
      allTimeRanks = _.map(allTimeRanks, (userId, idx) => addAttributesToRank(userId, allTimeRank + idx, false, userDocs));

      cb({
        weeklyEarth: weeklyRanks,
        allTimeEarth: allTimeRanks
      });
    });
  });
}

const userFieldsToQuery = {
  firstName: 1,
  lastName: 1,
  nameOfSchool: 1,
  weeklyStarCount: 1,
  totalStarCount: 1
};

const usersForIds = async ids => await User.find({ _id: { $in: ids } }, userFieldsToQuery);
const usersForClassId = async id => await User.find({ "classes.0.id": id }, userFieldsToQuery);

const addAttributesToRank = (userId, rank, isWeekly, users) => {
  const user = _.find(users, user => user._id.equals(userId));
  const obj = { userId: userId, rank: rank };
  if (user) {
    obj.school = user.nameOfSchool;
    obj.firstName = user.firstName;
    obj.lastName = user.lastName;
    obj.points = isWeekly ? user.weeklyStarCount : user.totalStarCount;
  }
  return obj;
}

const specificRanks = async (position, isWeekly, cb) => {
  const leaderboard = isWeekly ? WEEKLY_LEADERBOARD : ALL_TIME_LEADERBOARD;
  const beginning = Math.max(0, parseInt(position, 10));
  const end = beginning + 20;

  cache.zrevrange([ leaderboard, beginning, end ], async (error, ranks) => {
    if (error) { return cb({ error: error.message }); }

    const userDocs = await usersForIds(ranks);
    ranks = _.map(ranks, (userId, idx) => addAttributesToRank(userId, beginning + idx, isWeekly, userDocs));
    cb(isWeekly ? { weeklyEarth: ranks } : { allTimeEarth: ranks });
  });
}

const ranksForClass = async (classId, userId, onlyUser) => {
  try {
    const users = await usersForClassId(classId);
    
    const [weekly, allTime] = _.map([false, true], isWeekly => {
      return _.map(_.sortBy(_.map(users, user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        school: user.nameOfSchool,
        points: user[isWeekly ? "weeklyStarCount" : "totalStarCount"],
        userId: user._id
      })), user => -user.points), (user, idx) => _.extend({}, user, { rank: idx + 1 }));
    });

    const userRank = ranks => get(_.find(ranks, rank => rank.userId.equals(userId)), "rank");

    return {
      weeklyClass: onlyUser ? userRank(weekly) : weekly,
      allTimeClass: onlyUser ? userRank(allTime) : allTime
    };
  } catch (error) {
    return { error: error.message };
  }
}

exports.read = async (req, res, next) => {
  recordEvent(req.userId, req.sessionId, req.ip, req.path);

  let {
    save,
    userId,
    classId,
    onlyUser,
    position,
    isWeekly
  } = req.query;

  if (save) {

    saveCurrentRanks(response => res.status(200).send(response));

  } else if (userId && classId) {    

    const classRanks = await ranksForClass(classId, userId, onlyUser);
    if (classRanks.error) { return res.status(422).send({ error: classRanks.error }); }

    ranksAroundUser(userId, onlyUser, earthRanks =>
      res
        .status(earthRanks.error ? 422 : 200)
        .send({ ranks: _.extend(earthRanks, classRanks) }));

  } else if (position) {

    specificRanks(position, isWeekly, earthRanks => 
      res
        .status(earthRanks.error ? 422 : 200)
        .send(earthRanks));

  } else {

    return res.status(422).send({ error: "Invalid params." });

  }
};
