const _ = require("underscore");
const mongoose = require("mongoose");

const cache = require("../cache");
const LeaderboardController = require("../controllers/leaderboard");

module.exports.cache = async () => {
  const result = await LeaderboardController.saveRanks();
  console.log(result)
  process.exit();
};
