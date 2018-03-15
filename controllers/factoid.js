const mongoose = require('mongoose')
const _ = require('underscore')

const Factoid = require('../models/factoid')

//
// CREATE
//

const createFactoid = async (data) => {
  const existing = await Factoid.findOne({ value: data.value })
  if (existing) { return { error: `Factoid already exists: (${data.value})` } }

  const factoid = new Factoid(data)
    
  try {
    await factoid.save()
    return factoid
  } catch (error) {
    return { error: error.message }
  }   
}

exports.create = async (req, res, next) => {
  const data = req.body

  if (data.length) {
    const results = await Promise.all(data.map(createFactoid))
    const [errors, successes] = _.partition(results, (r) => r.error)
    return res.status(201).send({ errors: errors, successes: successes })
  } else {
    const result = await createFactoid(data)
    const statusCode = result.error ? 422 : 201
    return res.status(statusCode).send(result)
  }
}

//
// READ
//

exports.read = (req, res, next) => {
  Factoid.find({}, (error, factoids) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(201).send(factoids)    
  })
}

//
// UPDATE
//

exports.update = (req, res, next) => {
  Factoid.update({ _id: req.params.id }, req.body, async (error, factoid) => {
    if (error) { return res.status(422).send({ error: error.message }) }
      
    return factoid.n > 0
      ? res.status(201).send(factoid)
      : res.status(422).send({ error: `Could not find factoid: (${req.params.id})` })
  })
}

//
// DELETE
//

exports.delete = (req, res, next) => {
  Factoid.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) { return res.status(422).send({ error: error.message }) }
    
    return removed
      ? res.status(201).send(removed)
      : res.status(422).send({ error: `Could not find factoid: (${req.params.id})` })
  })
}
