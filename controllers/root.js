const mongoose = require('mongoose')
const _ = require('underscore')

const Root = require('../models/root')

exports.read = (req, res, next) => {
  Root.find({}, (error, roots) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(201).send(roots)
  })
}

exports.readOne = (req, res, next) => {
  Root.findOne({ value: req.params.value }, async (error, existing) => {
    if (error) { return res.status(422).send({ error: error.message }) }
    
    return existing
      ? res.status(201).send(existing)
      : res.status(422).send({ error: `Could not find root (${req.params.value})` })
  })
}
