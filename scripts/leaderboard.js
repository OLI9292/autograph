const _ = require('underscore')
const mongoose = require('mongoose')

const cache = require('../cache')
const LeaderboardController = require('../controllers/leaderboard')

module.exports.cache = async () => {
  const ranks = _.flatten(await LeaderboardController.allRanks())
  const stringified = JSON.stringify({ ranks: ranks })

  await cache.set('leaderboards', stringified)
  console.log(`Caching ${ranks.length} ranks.`)
  return
}
