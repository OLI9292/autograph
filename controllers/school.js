const _ = require('underscore')

const School = require('../models/school')
const User = require('../models/user')
const cache = require('../cache')

//
// CREATE
//

exports.create = async (req, res, next) => {
  try {
    const school = new School(req.body)
    await school.save()
    return res.status(201).send(school)
  } catch (error) {
    return res.status(422).send({ error: error.message })
  }  
}

//
// READ
//

exports.read = async (req, res, next) => {
  if (req.params.id) {
    
    School.findById(req.params.id, async (error, school) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      return school
        ? res.status(200).send(school)
        : res.status(422).send({ error: 'Not found.' })
    });

  } else {
    
    School.find({}, async (error, schools) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(schools)
    })

  }
}

const getLeaderboard = (students, allTime, initialize) => {
  const leaderboard = _.sortBy(students
    .map((s) => {
      return {
        _id: s._id,
        name: initialize ? s.initials() : s.firstNameLastInitial(),
        score: allTime ? s.starCount() : s.weeklyStarCount,
        school: s.schoolName
      }
    }), 'score')
    .filter((s) => s.score > 0)
    .reverse()
  leaderboard.forEach((s, i) => { s.position = i + 1 })
  return leaderboard
}

const sliceLeaderboardsForUser = (id, leaderboards) => {
  return _.mapObject(leaderboards, (v, k) => {
    return _.mapObject(v, (v, k) => {
      let index = _.findIndex(v, (s) => s._id === id)
      index = Math.max(0, index - 2)
      return v.slice(index, index + 20)
    })
  })
}

exports.leaderboards = async (req, res, next) => {
  
  cache.get('leaderboards', async (error, reply) => {
    if (error) {

      next()

    } else if (reply) {

      try {
        const schools = await School.find()

        let leaderboards = JSON.parse(reply)
        const school = _.find(schools, (s) =>  s._id.equals(req.params.id))

        leaderboards = _.pick(leaderboards, 'Earth', school.name)
        if (req.query.id) { leaderboards = sliceLeaderboardsForUser(req.query.id, leaderboards) }        

        return school
          ? res.status(200).send(leaderboards)
          : res.status(404).send({ error: 'Not found.' })        
      } catch (error) {
        return res.status(422).send({ error: error.message })
      }

    } else {

      try {

        const schools = await School.find()
        const students = await User.find({ school: { $exists: true } })
        students.forEach((student) => student.schoolName = _.find(schools, (school) => school._id.equals(student.school)))
        students.forEach((student) => student.schoolName = student.schoolName && student.schoolName.name)
        
        let leaderboards = {}
        
        leaderboards.Earth = {
          allTime: getLeaderboard(students, true, true),
          weekly: getLeaderboard(students, false, true)
        }

        schools.forEach((school) => {
          const classmates = students.filter((student) => student.school.equals(school._id))
          leaderboards[school.name] = {
            allTime: getLeaderboard(classmates, true, false),
            weekly: getLeaderboard(classmates, false, false)
          }
        })

        cache.set('leaderboards', JSON.stringify(leaderboards))
        cache.expire('leaderboards', 60)

        const school = _.find(schools, (s) =>  s._id.equals(req.params.id))

        leaderboards = _.pick(leaderboards, 'Earth', school.name)
        if (req.query.id) { leaderboards = sliceLeaderboardsForUser(req.query.id, leaderboards) }

        return school
          ? res.status(200).send(leaderboards)
          : res.status(404).send({ error: 'Not found.' })
      } catch (error) {
        return res.status(422).send({ error: error.message })
      }
    }
  })
}

//
// UPDATE
//

exports.update = async (req, res, next) => {
  School.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, async (error, school) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return school
      ? res.status(200).send(school)
      : res.status(422).send({ error: 'Not found.' })
  })
}

//
// DELETE
//

exports.delete = async (req, res, next) => {
  School.findOneAndRemove({ _id: req.params.id }, async (error, school) => {
    if (error) { return res.status(422).send({ error: error.message }) } 

    return school
      ? res.status(200).send(school)
      : res.status(422).send({ error: 'Not found.' })
  })  
}
