const mongoose = require('mongoose');
const _ = require("underscore");
const get = require("lodash/get");

const cache = require("../cache");
const User = require("../models/user");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

// Constants

const WEEKLY_LEADERBOARD = "weekly_leaderboard";
const ALL_TIME_LEADERBOARD = "all_time_leaderboard";
const RANKS_QUERY_COUNT = 19;


// Mongo user queries

const userFieldsToQuery = {
  firstName: 1,
  lastName: 1,
  nameOfSchool: 1,
  weeklyStarCount: 1,
  totalStarCount: 1
};

const allUsers = async () => await User.find({ isTeacher: false }, userFieldsToQuery);

const usersForIds = async ids => await User.find({ _id: { $in: ids } }, userFieldsToQuery);

const usersForClassId = async id => await User.find({ "classes.0.id": id, isTeacher: false }, userFieldsToQuery);


// Saves weekly and total star counts for students in redis sorted sets

const saveCurrentRanks = async cb => {
  try {
    const users = await allUsers();

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
  } catch(error) {
    cb({ error: error.message });
  }
}


// Resets weeklyStarCount for all users and weekly records in redis

const clearWeeklyRanks = async cb => {
  User.updateMany({}, { weeklyStarCount: 0 }, (error, response) => {
    if (error) { return cb({ error: error.message }); }

    cache.del(WEEKLY_LEADERBOARD);
    
    cb({ success: true });
  });
}


// Finds the rank for a user, and returns ranksForRange

const ranksAroundUser = (userId, onlyUser, cb) => {
  const weeklyQuery = [WEEKLY_LEADERBOARD, userId];
  const allTimeQuery = [ALL_TIME_LEADERBOARD, userId];

  cache.zrevrank(weeklyQuery, (error, weeklyRank) => {
    if (error) { return cb({ error: error.message }); }

    cache.zrevrank(allTimeQuery, (error, allTimeRank) => {
      if (error) { return cb({ error: error.message }); }
      if (onlyUser) { return cb({ weeklyEarth: weeklyRank, allTimeEarth: allTimeRank }); }

      ranksForRange(weeklyRank || 0, allTimeRank || 0, response => cb(response));
    });
  });  
}


// Returns the next 20 ranks

const ranksForRange = async (weeklyRank, allTimeRank, cb) => {
  const allTimeRangeQuery = [ALL_TIME_LEADERBOARD, allTimeRank, allTimeRank + RANKS_QUERY_COUNT];
  const weeklyRangeQuery = [WEEKLY_LEADERBOARD, weeklyRank, weeklyRank + RANKS_QUERY_COUNT];

  cache.zrevrange(allTimeRangeQuery, async (error, allTimeRanks) => {
    if (error) { return cb({ allTimeEarth: [], weeklyEarth: [] }); }

    cache.zrevrange(weeklyRangeQuery, async (error, weeklyRanks) => {  
      if (error) { return cb({ allTimeEarth: allTimeRanks, weeklyEarth: [] }); }

      const userDocs = await usersForIds(_.union(weeklyRanks, allTimeRanks));

      weeklyRanks = _.map(weeklyRanks, (userId, idx) => addAttributesToRank(userId, weeklyRank + idx, true, userDocs));
      allTimeRanks = _.map(allTimeRanks, (userId, idx) => addAttributesToRank(userId, allTimeRank + idx, false, userDocs));

      cb({
        allTimeEarth: allTimeRanks,
        weeklyEarth: weeklyRanks
      });
    });
  });
}


// Adds attributes from user documents to ranks

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


// Returns the next 20 ranks

const specificRanks = async (position, isWeekly, cb) => {
  const leaderboard = isWeekly ? WEEKLY_LEADERBOARD : ALL_TIME_LEADERBOARD;
  const beginning = Math.max(0, parseInt(position, 10));
  const end = beginning + RANKS_QUERY_COUNT;

  cache.zrevrange([ leaderboard, beginning, end ], async (error, ranks) => {
    if (error) { return cb({ error: error.message }); }

    const userDocs = await usersForIds(ranks);
    ranks = _.map(ranks, (userId, idx) => addAttributesToRank(userId, beginning + idx, isWeekly, userDocs));
    cb(isWeekly ? { weeklyEarth: ranks } : { allTimeEarth: ranks });
  });
}


// Returns the ranks for a class

const ranksForClass = async (classId, userId, onlyUser) => {
  try {
    const users = await usersForClassId(classId);
    
    const [weekly, allTime] = _.map([true, false], isWeekly => {
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
    clearWeekly,
    userId,
    classId,
    onlyUser,
    position,
    isWeekly
  } = req.query;

  if (save) {

    saveCurrentRanks(response =>
      res.status(response.error ? 422 : 200).send(response));

  } else if (clearWeekly) {

    clearWeeklyRanks(response =>
      res.status(response.error ? 422 : 200).send(response));

  } else if (userId || classId) {    

    const classRanks = classId ? (await ranksForClass(classId, userId, onlyUser)) : {};
    if (classRanks.error) { return res.status(422).send({ error: classRanks.error }); }

    // No userId passed for teachers on client, so we set it to the highest scoring student
    if (!userId) { userId = get(_.first(classRanks.allTimeClass), "userId"); }
    if (!userId) { return res.status(422).send({ error: "No class ranks found." }); }

    ranksAroundUser(userId, onlyUser, earthRanks =>
      res
        .status(earthRanks.error ? 422 : 200)
        .send({ ranks: _.extend(earthRanks, classRanks) }));

  } else if (position) {

    specificRanks(position, isWeekly, earthRanks => 
      res
        .status(earthRanks.error ? 422 : 200)
        .send({ ranks: earthRanks }));

  } else {

    return res.status(422).send({ error: "Invalid params." });

  }
};
