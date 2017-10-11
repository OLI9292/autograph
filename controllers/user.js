const mongoose = require('mongoose')
const _ = require('underscore')

const User = require('../models/user')

exports.create = async (req, res, next) => {
  const data = req.body

  try {
    const existing = await User.findOne({ email: data.email })

    if (existing) {
      let message = 'There is already an account associated with this email'
      console.log(message)
      return res.status(422).send({ error: message })
    } else {
      console.log('hi')
      const user = new User(data)
      console.log('yo')
      await user.save()
      console.log('he')
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
          result = { success: true }
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
