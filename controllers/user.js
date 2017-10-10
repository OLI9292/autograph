const mongoose = require('mongoose')
const _ = require('underscore')

const User = require('../models/user')

const testUser = new User({
  username: 'jmar777',
  password: 'Password123'
})

exports.create = async (req, res, next) => {
  try {
    const existing = await User.findOne({ value: testUser.username })

    if (existing) {
      let message = `Username already taken`
      console.log(message)
      return res.status(422).send({ error: message })
    } else {
      const user = await testUser.save()
      return res.status(201).send(user)
    }
  } catch (e) {
    let message = `Error creating user: ${e}`
    console.log(message)
    return res.status(422).send({ error: message })
  }
}
