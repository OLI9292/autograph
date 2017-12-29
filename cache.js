const redis = require('redis')

let client

if (process.env.REDISTOGO_URL) {
  const rtg = require('url').parse(process.env.REDISTOGO_URL)
  client = redis.createClient(rtg.port, rtg.hostname)
  client.auth(rtg.auth.split(':')[1])
} else {
  client = redis.createClient()
}

client.on('connect', function() {
  console.log('Redis connected')
})

client.on('error', function(err) {
  console.log('Error ' + err)
})

module.exports = client
