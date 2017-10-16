const mongoose = require('mongoose')
const _ = require('underscore')

const User = require('../models/user')

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
  const data = req.body.stats;
  
  User.findById(req.body.id, async (err, user) => {
    if (err) {
      return res.status(422).send({ error: `Error finding user ${req.params.id} -> ${err.message}` })
    }
    return res.status(201).send({ success: true })
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
        user.words = wordExperience
        try {
          await user.save()
          return res.status(201).send({ success: true, wordExperience: wordExperience })
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
    User.find({}, async (err, users) => {
      if (err) {
        return res.status(422).send({ error: `Error retrieving users -> ${err.message}` })
      }
      return res.status(201).send({ count: users.length, users: users })
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

exports.create = async (req, res, next) => {
  const data = req.body

  try {
    const existing = await User.findOne({ email: data.email })

    if (existing) {
      let message = 'There is already an account associated with this email'
      console.log(message)
      return res.status(422).send({ error: message })
    } else {
      const user = new User(data)
      await user.save()
      return res.status(201).send({ success: true, user: user })
    }
  } catch (e) {
    let message = 'Error creating user'
    console.log(`${message}: ${e}`)
    return res.status(422).send({ error: message })
  }
}

exports.login = async (req, res, next) => {
  const data = req.body

  try {
    const existing = await User.findOne({ email: data.email })
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
