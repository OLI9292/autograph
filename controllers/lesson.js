const _ = require('underscore')

const Lesson = require('../models/lesson')
const User = require('../models/user')

exports.create = async (req, res, next) => {
  if (_.has(req.params, 'id')) {
    User.findById(req.params.id, async (err, user) => {
      if (err) {
        return res.status(422).send({ error: `Error finding user ${req.params.id} -> ${err.message}` })
      }
      return res.status(201).send({ user: user })
    })
  }
}
