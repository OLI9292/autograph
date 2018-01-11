const moment = require('moment');
const redis = require('redis');

const client = redis.createClient();

module.exports = (userKey, sessionKey, ip, path) => {  
  console.log(userKey, sessionKey, ip, path)

  const userSessionKey = userKey + ":" + sessionKey;
  const timeoutKey = userSessionKey + ":timeout";

  const payload = {
    ip: ip,
    path: path,
    at: moment().format(),
  };

  const multi = client.multi();

  /*multi.sadd('known_sessions', userSessionKey);
  multi.rpush(userSessionKey, JSON.stringify(payload)); 
  multi.set(timeoutKey, 'timeout');
  multi.expire(timeoutKey, 1800);
  multi.exec();*/
};
