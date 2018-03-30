const _ = require("underscore");
const mongoose = require("mongoose");

const cache = require("../cache");
const LeaderboardController = require("../controllers/leaderboard");

module.exports.cache = async () => {
  // Cache ranks
  const ranks = _.flatten(await LeaderboardController.allRanks());
  OLOG.log({ level: "info", message: `Caching ${ranks.length} ranks.` });
  const stringified = JSON.stringify({ ranks: ranks });
  await cache.set("leaderboards", stringified);

  // Close connections
  if (process.env.NODE_ENV !== "test") {
    mongoose.connection.close();
  }
  cache.unref();

  return;
};
