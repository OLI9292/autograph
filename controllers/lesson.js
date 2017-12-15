const _ = require('underscore')

const Lesson = require('../models/lesson')
const Class = require('../models/class')

//
// CREATE
//

exports.create = async (req, res, next) => {
  try {
    const lesson = new Lesson(req.body)
    await lesson.save()
    return res.status(201).send(lesson)
  } catch (error) {
    return res.status(422).send({ error: error.message })
  }  
}

//
// READ
//

exports.read = async (req, res, next) => {
  if (req.params.id) {
    
    Lesson.findById(req.params.id, async (error, lesson) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      return lesson
        ? res.status(200).send(lesson)
        : res.status(422).send({ error: 'Not found.' })
    });

  } else {
    
    Lesson.find({}, async (error, lessons) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(lessons)
    })

  }
}

//
// UPDATE
//

exports.update = async (req, res, next) => {
  Lesson.update({ _id: req.params.id }, req.body, async (error, lesson) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return lesson.n > 0
      ? res.status(200).send(req.body)
      : res.status(422).send({ error: 'Not found.' })
  })
}

//
// DELETE
//

exports.delete = async (req, res, next) => {
  Lesson.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) { return res.status(422).send({ error: error.message }) } 

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: 'Not found.' })
  })  
}
