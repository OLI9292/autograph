const _ = require('underscore')
const mongoose = require('mongoose')

const LeaderboardController = require('../controllers/leaderboard')
const cache = require('../cache')
const CONFIG = require('../config/main')

mongoose.Promise = global.Promise
mongoose.connect(CONFIG.MONGODB_URI, { useMongoClient: true, promiseLibrary: global.Promise })

const load = async () => {
  const ranks = _.flatten(await LeaderboardController.allRanks())

  cache.set('leaderboards', JSON.stringify({ ranks: ranks }), (err, res) => {
    console.log(`Caching ${ranks.length} ranks.`)
    cache.quit()
    mongoose.disconnect()
  })
}

load()
