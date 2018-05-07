const _ = require("underscore");
const get = require("lodash/get");

const User = require("../models/user");
const cache = require("../cache");

//
// CREATE
//

exports.join = async (req, res, next) => {

  const {
    userId
  } = req.query;

  return await cache.rpop("lobby", (error, reply) => {
    if (error) {
      return res.status(200).send(error.message);
    } else if (!reply) {
      console.log(get(error, "message") || "No players in game lobby.");
      const timestamp = new Date().getTime();
      cache.lpush("lobby", `${userId}:${timestamp}`);
      return res.status(200).send({});
    } else {
      const [opponentId, timestamp] = reply.split(":");
      
      User.findById(opponentId, (error, user) => {
        if (error || !user) {
          return res.status(422).send({ error: get(error, "message") || "Opponent doc not found." });
        }

        return res.status(200).send(user);
      });
    }
  });
};
