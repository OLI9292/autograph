const mongoose = require('mongoose')
const _ = require('underscore')

const User = require('../models/user')
const Class = require('../models/class')

let redis

if (process.env.REDISTOGO_URL) {
  const rtg = require('url').parse(process.env.REDISTOGO_URL)
  redis = require('redis').createClient(rtg.port, rtg.hostname)
  redis.auth(rtg.auth.split(":")[1])
} else {
  redis = require("redis").createClient()
}

const userIdQuery = (query) => {
  return _.has(query, 'facebookId')
    ? { facebookId: query.facebookId }
    : _.has(query, 'email') ? { email: query.email } : null
}

exports.update = async (req, res, next) => {
  if (req.body.platform === 'web') {
    return await updateFromWeb(req, res, next)
  } else {
    return await updateFromMobile(req, res, next)
  }
}

const updateFromWeb = async (req, res, next) => {
  const stats = req.body.stats;

  if (_.isNull(stats) || _.isEmpty(stats)) {
    return res.status(422).send({ error: 'No stats found in body' })
  }
  
  User.findById(req.body.id, async (err, user) => {
    if (user) {
      stats.forEach((s) => {
        const existingIdx = _.findIndex(user.words, (w) => s.word === w.name);
        if (existingIdx >= 0) {
          const copy = user.words[existingIdx];
          copy.seen += 1;
          copy.correct += s.correct ? 1 : 0;
          copy.experience += s.difficulty >= copy.experience && s.correct ? 1 : 0;
          copy.timeSpent += s.time || 0;
          user.words[existingIdx] = copy;
        } else {
          const word = { name: s.word, correct: s.correct ? 1 : 0, timeSpent: 2 }
          user.words.push(word);
        }
      })

      try {
        await user.save()
        return res.status(201).send({ user: user })      
      } catch (e) {
        return res.status(422).send({ error: `Error saving stats for user -> ${e}` })
      }
    } else {
      return res.status(422).send({ error: `Error finding user ${req.params.id} -> ${err.message}` })
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
        if (wordExperience.length >= user.words) {
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
      return res.status(422).send({ error: `Could not find user: ${JSON.stringify(query)}` })
    })
  } else {
    return res.status(422).send({ error: 'Unsupported user query' })    
  }
}

exports.read = async (req, res, next) => {
  if (_.has(req.params, 'id')) {
    User.findById(req.params.id, async (err, user) => {
      if (err) {
        return res.status(422).send({ error: `Error finding user ${req.params.id} -> ${err.message}` })
      }
      return res.status(201).send({ user: user })
    })
  } else if (_.isEmpty(req.query)) {
    redis.get('users', (err, reply) => {
      if (err) {
        next()
      } else if (reply) {
        const users = JSON.parse(reply)
        return res.status(201).send({ count: users.length, users: users })
      } else {
        User.find({}, (err, users) => {
          if (err) {
            return res.status(422).send({ error: `Error retrieving users -> ${err.message}` })
          }
          redis.set('users', JSON.stringify(users))
          return res.status(201).send({ count: users.length, users: users })
        })
      }
    })
  } else {
    const query = userIdQuery(req.query)

    if (query) {
      User.findOne(query, async (err, user) => {
        if (err) {
          return res.status(422).send({ error: `Error retrieving user -> ${err.message}` })
        } else if (user) {
          return res.status(201).send({ success: true, user: user })
        }
        return res.status(422).send({ error: `Could not find user: ${JSON.stringify(query)}` })
      })
    } else {
      return res.status(422).send({ error: 'Unsupported user query' })    
    }
  }
}

const createUser = async (data) => {
  try {
    const existing = await User.findOne({ email: data.email })

    if (existing) {
      let message = 'There is already an account associated with this email'
      console.log(message)
      return { error: message }
    } else {
      const user = new User(data)
      await user.save()
      return { user: user }
    }
  } catch (e) {
    let message = `Error creating user -> ${e}`
    console.log(message)
    return { error: message }
  }
}

const createMultipleResult = (results) => {
  const errors = _.compact(_.pluck(results, 'error'))
  const succesful = results.filter((r) => !_.has(r, 'error'))
  return { 
    errorCount: errors.length,
    errors: errors,
    succesfulCount: succesful.length,
    results: succesful
  }
}

exports.create = async (req, res, next) => {
  const data = req.body
  const batch = _.isArray(data)

  if (batch) {
    const results = await Promise.all(data.map(createUser))
    const response = createMultipleResult(results, res)
    const statusCode = response.results.length > 0 ? 201 : 422
    return res.status(statusCode).send({ response })
  } else {
    let response = await createUser(data)
    if (_.has(response, 'error')) {
      return res.status(422).send(response)
    } else {
      response.success = true
      return res.status(201).send(response)
    }
  }
}

exports.login = async (req, res, next) => {
  const data = req.body

  try {
    const existing = await User.findOne({ email: data.email.toLowerCase() })
    if (existing) {
      existing.comparePassword(data.password, function(err, isMatch) {
        let result, statusCode
        if (err) {
          result = { error: `Error matching password: ${err}` }
          statusCode = 422
        } else if (isMatch) {
          result = { user: existing, success: true }
          statusCode = 201
        } else {
          result = { error: 'Incorrect password' }
          statusCode = 422
        }
        return res.status(statusCode).send(result)
      })
    } else {
      let message = 'Email not found'
      console.log(message)
      return res.status(422).send({ error: message })
    }
  } catch (e) {
    let message = 'Error finding user'
    console.log(`${message}: ${e}`)
    return res.status(422).send({ error: message })
  }
}

exports.delete = (req, res, next) => {
  User.remove({}, async (err) => {
    if (err) {
      let message = `Error deleting users -> ${err.message}`
      console.log(message)
      return res.status(422).send({ error: message })
    }
    return res.status(201).send('Deleted all users')
  })
}
