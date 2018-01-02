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
        : res.status(404).send({ error: 'Not found.' })
    });

  } else {
    
    School.find({}, async (error, schools) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(schools)
    })

  }
}

//
// UPDATE
//

exports.update = async (req, res, next) => {
  School.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, async (error, school) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return school
      ? res.status(200).send(school)
      : res.status(404).send({ error: 'Not found.' })
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
      : res.status(404).send({ error: 'Not found.' })
  })  
}
