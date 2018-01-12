const jwt = require('jwt-simple')
const mongoose = require('mongoose')
const _ = require('underscore')

const Class = require('../models/class')
const School = require('../models/school')
const User = require('../models/user')

const recordEvent = require('../middlewares/recordEvent');

//
// CREATE
//

exports.create = async (req, res, next) => {
  const data = req.body

  if (_.isArray(data)) {

    const results = await Promise.all(data.map(createUser))
    return res.status(201).send(results)

  } else {

    let response = await createUser(data)
    return response.error
      ? res.status(422).send(response)
      : res.status(201).send(response)

  }
}

const createUser = async (data) => {
  try {
    const existing = await User.findOne({ email: data.email })
    
    if (existing) {
      return { error: 'There is already an account associated with this email.' }
    }

    const user = new User(data)
    await user.save()
    return user
  } catch (error) {
    return { error: 'Something went wrong.' }
  }
}

//
// READ
//

const userIdQuery = (query) => {
  return _.has(query, 'facebookId')
    ? { facebookId: query.facebookId }
    : _.has(query, 'email') ? { email: query.email } : null
}

exports.read = async (req, res, next) => {
  if (req.params.id) {
    recordEvent(req.userId, req.sessionId, req.ip, req.path);

    User.findById(req.params.id, async (error, user) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(user)
    })

  } else if (!_.isEmpty(req.query)) {

    const query = userIdQuery(req.query)

    if (query) {
      User.findOne(query, async (error, user) => {
        if (error) { return res.status(422).send({ error: error.message }) }

        return user
          ? res.status(200).send({ success: true, user: user })
          : res.status(404).send({ error: 'Not found.' })
      })
    } else {
      return res.status(422).send({ error: 'Unsupported user query.' })    
    }

  } else {

    User.find({}, (error, users) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(users)
    })    

  }
}

//
// UPDATE
//

exports.update2 = async (req, res, next) => {
  User.update({ _id: req.params.id }, req.body, async (error, result) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return result.n > 0
      ? res.status(200).send(req.body)
      : res.status(404).send({ error: 'Not found.' })
  })  
}

exports.update = async (req, res, next) => {
  if (req.body.platform === 'web') {
    recordEvent(req.userId, req.sessionId, req.ip, req.path)
    return await updateFromWeb(req, res, next)
  } else {
    return await updateFromMobile(req, res, next)
  }
}

const updateFromWeb = async (req, res, next) => {
  const [id, stats] = [req.body.id, req.body.stats]

  if (!id || !_.isArray(stats)) { return res.status(422).send({ error: 'Id and stats required.' }) }
  
  User.findById(req.body.id, async (error, user) => {
    if (error) { return res.status(422).send({ error: error.message }); }

    if (user) {

      const oldExperience = user.words.reduce((acc, w) => acc + w.experience, 0);

      stats.forEach((s) => {
        const idx = _.findIndex(user.words, (w) => s.word === w.name)

        if (idx >= 0) {
          
          // Update old words
          const copy = user.words[idx]
          copy.seen += 1
          copy.correct += s.correct ? 1 : 0
          copy.experience += s.difficulty >= copy.experience && s.correct ? 1 : 0
          copy.timeSpent += s.time || 0
          user.words[idx] = copy

        } else {
          
          // Add new words
          user.words.push({
            name: s.word,
            correct: s.correct ? 1 : 0,
            timeSpent: s.time
          })
          
        }
      })

      // Update weekly experience
      const newExperience = user.words.reduce((acc, w) => acc + w.experience, 0);
      user.weeklyStarCount = user.weeklyStarCount + (newExperience - oldExperience);

      // Update word list completion
      if (req.body.wordList) {
        user.wordListsCompleted = _.uniq(_.union(user.wordListsCompleted || [], [req.body.wordList]));
      }

      try {
        await user.save()
        return res.status(200).send(user)
      } catch (error) {
        return res.status(422).send({ error: error.message })
      }
    } else {
      return res.status(404).send({ error: 'User not found.' });
    }
  })
}

const updateFromMobile = async (req, res, next) => {
  const keys = ['name', 'correct', 'seen', 'experience', 'timeSpent']
  let wordExperience = req.body.wordExperience
  wordExperience = wordExperience.filter((e) => _.isEqual(_.sortBy(keys), _.sortBy(_.keys(e))))
  const query = userIdQuery(req.query)

  if (query && !_.isEmpty(wordExperience)) {
    User.findOne(query, async (err, user) => {
      if (err) {
        return res.status(422).send({ error: `Error retrieving user -> ${err.message}` })
      } else if (user) {
        if (wordExperience.length >= user.words.length) {
          user.words = wordExperience
        }
        try {
          const users = await User.aggregate([
            { '$project': { '_id': 1, 'words': 1, 'length': { '$size': '$words' } }},
            { '$sort': { 'length': -1 } }])
          const ranking = _.findIndex(users, (u) => user._id.equals(u._id))
          if (ranking >= 0) {
            user.ranking = ranking + 1
          }
          await user.save()
          return res.status(201).send({ success: true, user: user })
        } catch (e) {
          return res.status(422).send({ error: 'Error saving word experience' })
        }
      }
      return res.status(404).send({ error: 'Not found.' })
    })
  } else {
    return res.status(422).send({ error: 'Unsupported user query' })    
  }
}

exports.joinClass = async (req, res, next) => {
  const [classId, students] = [req.body.classId, req.body.students]

  if (!classId || !_.isArray(students)) { return res.status(422).send({ error: 'Invalid query.' }) }

  await Class.findById(classId, (err, _class) => {
    if (error)  { return res.status(422).send({ error: error.message }) }
    if (_class) { return res.status(404).send({ error: 'Not found.' }) }

    User.find({ _id: { $in: students } }, async (err, students) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      const newStudents = _.reject(students, (s) => _class.students.some((o) => o.equals(s._id)))

      await newStudents.forEach(async (n) => {
        if (!_.some(n.classes, (c) => c.equals(classId))) {
          n.classes.push({ id: classId, role: 'student' })
          await n.save()
        }
      })

      _.pluck(newStudents, '_id').forEach((id) => _class.students.push(id))
      
      await _class.save()
      return res.status(200).send(_class)
    });
  })
}

exports.joinSchool = async (req, res, next) => {
  const [schoolId, users] = [req.body.school, req.body.users]
  
  if (!schoolId || !_.isArray(users)) { return res.status(422).send({ error: 'Invalid params.' }) }

  School.findById(schoolId, async (error, school) => {
    if (error) { return res.status(422).send({ error: error.message }) }
    if (!school) { return res.status(404).send({ error: 'Not found.' }) }

    User.updateMany({ _id: { $in: users } }, { $set: { 'school': school._id } }, async (error, users) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send({ success: true })
    })
  })
}

exports.resetStarCounts = async (req, res, next) => {
  User.updateMany({}, { $set: { 'weeklyStarCount': 0 } }, async (error, users) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(200).send({ success: true })
  })
}

//
// DELETE
//

exports.delete = (req, res, next) => {
  User.findOneAndRemove({ _id: req.params.id }, async (error, user) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(200).send(user)
  })
}

//
// LOGIN
//

const expiresIn = (numDays) => {
  var dateObj = new Date()
  return dateObj.setDate(dateObj.getDate() + numDays)
}

const genToken = (user) => {
  const expires = expiresIn(7)
  const token = jwt.encode({ exp: expires }, process.env.VALIDATION_TOKEN)
  return { user: user._id, expires: expires, token: token }
}

exports.login = async (req, res, next) => {
  const data = req.body

  try {
    const user = await User.findOne({ email: data.email.toLowerCase() })

    if (user) {
      user.comparePassword(data.password, function(error, isMatch) {
        let result, statusCode

        if (error) {
          statusCode = 422
          result = { error: 'Something went wrong.' }
        } else if (isMatch) {
          statusCode = 201
          result = { user: user, success: true, token: genToken(user) }
        } else {
          statusCode = 422
          result = { error: 'Incorrect password.' }
        }

        return res.status(statusCode).send(result)
      })
    } else {
      return res.status(404).send({ error: 'Email not found.' })
    }
  } catch (error) {
    return res.status(422).send({ error: 'Error finding user.' })
  }
}
