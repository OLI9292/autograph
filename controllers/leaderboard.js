const _ = require('underscore')

const cache = require('../cache')
const School = require('../models/school')
const User = require('../models/user')

exports.allRanks = async () => {
  const schools = await School.find()
  return await Promise.all(_.flatten([schools.map(ranksFor), ranksFor()]))
}

const ranksFor = async (school) => {
  const students = school ? (await User.find({ school: school._id })) : (await User.find())

  return _.flatten([true, false].map((isWeekly) => {
    return _.sortBy(students
      .map((student) => ({
        id: `${student._id}-${school ? school.name : 'Earth'}-${isWeekly ? 'weekly' : 'all'}`,
        _id: student._id,
        name: school ? student.firstNameLastInitial() : student.initials(),
        score: isWeekly ? student.weeklyStarCount : student.starCount(),
        schoolName: (school && school.name) || 'Earth',
        group: (school && school._id) || 'Earth',
        period: isWeekly ? 'weekly' : 'all'
      })), 'score')
      .reverse()
      .filter((student) => student.score > 0)
      .map((student, idx) => _.extend({}, student, { position: idx + 1 }))
  }))
}

const filterRanks = (ranks, query) => {
  if (query.user) {
    const grouped = _.values(_.groupBy(ranks, (r) => `${r.group}-${r.period}`))
    ranks = _.flatten(grouped
      .filter(g => _.contains(g.map(r => r._id.toString()), query.user))
      .map((g) => {
        const index = Math.max(_.findIndex(g, g => g._id.toString() === query.user) - 2, 0)
        return g.slice(index, index + 20)
      }))
  } else {
    const start = parseInt(query.start)
    if (query.school) { ranks = ranks.filter(r => r.group && r.group.toString() === query.school) }
    if (query.period) { ranks = ranks.filter(r => r.period === query.period) }
    if (start > 0)    { ranks = ranks.slice(start, start + 20) }
  }

  return ranks
}

/**
 * QUERY:
 *     - user (id)
 *     - start (int)
 *     - period (weekly or all)
 *     - school (id)
 *
 * RETURNS:
 *     - [_id, name, score, position, period, group]
 */

exports.read = async (req, res, next) => {  
  cache.get('leaderboards', async (error, reply) => {
    if (error) {
      next()
    } else if (reply) {
      let ranks = JSON.parse(reply).ranks
      
      if (req.query) {
        ranks = filterRanks(ranks, req.query)
      }
      
      return res.status(200).send(ranks)      
    } else {
      return res.status(404).send({ error: 'Not found.' })
    }
  })
}
