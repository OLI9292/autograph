const moment = require("moment");
const redis = require("redis");
const cache = require("../cache");

module.exports = (userKey, sessionKey, ip, path) => {
  if (!userKey || !sessionKey || !ip || !path) {
    return;
  }

  const userSessionKey = userKey + ":" + sessionKey;
  const timeoutKey = userSessionKey + ":timeout";
  const payload = { ip: ip, path: path, at: moment().format() };

  const multi = cache.multi();
  multi.sadd("known_sessions", userSessionKey);
  multi.rpush(userSessionKey, JSON.stringify(payload));
  multi.set(timeoutKey, "timeout");
  multi.expire(timeoutKey, 600);
  multi.exec();
};
