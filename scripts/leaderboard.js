const _ = require("underscore");
const mongoose = require("mongoose");

const cache = require("../cache");
const LeaderboardController = require("../controllers/leaderboard");

module.exports.cache = async () => {
<<<<<<< HEAD
  const result = await LeaderboardController.saveRanks();
  console.log(result)
  process.exit();
=======
  // Cache ranks
  /*const ranks = _.flatten(await LeaderboardController.allRanks());
  OLOG.log({ level: "info", message: `Caching ${ranks.length} ranks.` });
  const stringified = JSON.stringify({ ranks: ranks });
  await cache.set("leaderboards", stringified);

  // Close connections
  if (process.env.NODE_ENV !== "test") {
    mongoose.connection.close();
  }
  cache.unref();

  return;*/
>>>>>>> 2e6d75b474a8bfe4c8b653967d77693a744006b0
};
