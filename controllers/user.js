const mongoose = require('mongoose')
const _ = require('underscore')

const User = require('../models/user')

exports.read = async (req, res, next) => {
  if (_.isEmpty(req.query)) {
    User.find({}, async (err, users) => {
      if (err) {
        return res.status(422).send({ error: `Error retrieving users -> ${err.message}` })
      }
      return res.status(201).send({ count: users.length, users: users })
    })
  } else {
    const query = _.has(req.query, 'facebookId')
      ? { facebookId: req.query.facebookId }
      : _.has(req.query, 'email') ? { email: req.query.email } : null

    if (query) {
      User.findOne(query, async (err, user) => {
        if (err) {
          return res.status(422).send({ error: `Error retrieving user -> ${err.message}` })
        } else if (user) {
          return res.status(201).send({ user: user })
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
      return res.status(201).send(user)
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
          result = existing
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

exports.update = async (req, res, next) => {
  const data = req.body
  console.log(data)
  return res.status(201).send('hi')
}
