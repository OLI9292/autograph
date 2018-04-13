const mongoose = require('mongoose');
const _ = require("underscore");

const cache = require("../cache");
const Class = require("../models/class");

const recordEvent = require("../middlewares/recordEvent");

const WEEKLY_LEADERBOARD = "weekly_leaderboard";
const ALL_TIME_LEADERBOARD = "all_time_leaderboard";

exports.read = async (req, res, next) => {
  recordEvent(req.userId, req.sessionId, req.ip, req.path);

  let {
    save,
    userId
  } = req.query;

  if (save) {

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
        return res.status(200).send({
          weekly: error1 || `Added ${response1} ranks.`,
          allTime: error2 || `Added ${response2} ranks.`
        });
      });
    });

  } else if (userId) {    

    cache.zrevrank([WEEKLY_LEADERBOARD, userId], (error, weeklyRank) => {
      if (error) { return res.status(422).send({ error: error.message }); }

      cache.zrevrank([ALL_TIME_LEADERBOARD, userId], (error, allTimeRank) => {
        return error
          ? res.status(422).send({ error: error.message })
          : res.status(200).send({ weekly: weeklyRank, allTime: allTimeRank });
      });
    });

  }
};
