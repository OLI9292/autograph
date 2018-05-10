const _ = require("underscore");
const get = require("lodash/get");

const User = require("../models/user");
const cache = require("../cache");
const { guid } = require("../lib/helpers");

const randomQuestionsCount = () => _.sample(_.flatten([
  Array(2).fill(15),
  Array(4).fill(30),
  Array(1).fill(40),
  Array(1).fill(50)
]));

/**
 * Searches for a multiplayer game.
 * @param {string} userId - User ID. 
 * @param {string} cursor - Redis 'scan' cursor.
 * @param {callback} cb - Callback w/ api response.
 *
 * @returns {object} empty object if no available games, opponent user doc if game found, otherwise an error
 */
const scanForGame = (userId, cursor, cb) => {
  cache.scan(
    cursor,
    'MATCH', 'game:*',
    'COUNT', '10',
    (error, response) => { 

    if (error) {
      return cb({ error: error.message });
    } 

    cursor = response[0];
    const gameKey = _.sample(response[1]);

    if (!gameKey) {

      if (cursor !== '0') {
        return scanForGame(userId, cursor, cb);
      }

      const gameKey = `game:${guid()}`;
      const questionsCount = randomQuestionsCount();

      cache.hmset(
        gameKey,
        "opponentId", userId,
        "questionsCount", questionsCount
      );
      
      cache.expire(gameKey, 3);
      console.log(`Setting game key: ${gameKey}.`)
      return cb({ id: gameKey.slice(5), questionsCount: questionsCount });

    } else {
      cache.hmget(gameKey, "opponentId", "questionsCount", (error, result) => {
        cache.del(gameKey);
        
        const [opponentId, questionsCount] = result;
        console.log(`Found game against ${opponentId} (# questions: ${questionsCount}).`);
        
        if (error || !opponentId) {
          return cb({ error: get(error, "message") || "Game key not found." });
        }

        User.findById(opponentId, (error, user) => {
          if (error || !user) {
            return cb({ error: get(error, "message") || "Opponent doc not found." });
          }

          const game = {
            id: gameKey.slice(5),
            opponentUsername: user.firstName,
            opponentElo: user.elo,
            opponentId: opponentId,
            questionsCount: questionsCount
          };

          return cb(game);
        });        
      });      
    }
  });  
}

exports.read = async (req, res, next) => {
  const userId = req.query.userId;
  const cursor = "0";

  scanForGame(userId, cursor, result => {
    return res
      .status(result.error ? 422 : 200)
      .send(result);
  });
}
