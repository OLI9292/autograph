const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let client

const redisUrl = 'redis://redistogo:74cecb2cfffc720636474005de4a752a@grouper.redistogo.com:10415/';
//process.env.REDISTOGO_URL
if (redisUrl) {
  const rtg = require('url').parse(redisUrl)
  client = redis.createClient(rtg.port, rtg.hostname)
  client.auth(rtg.auth.split(':')[1])
} else {
  client = redis.createClient()
}

client.on('connect', function() {
  console.log({ level: 'info', message: 'Redis connected' })
})

client.on('error', function(error) {
  console.log({ level: 'error', message: error })
})

module.exports = client
