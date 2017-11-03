const _ = require('underscore')

const Lesson = require('../models/lesson')
const Class = require('../models/class')

exports.read = async (req, res, next) => {
  if (_.has(req.params, 'id')) {
    Lesson.findById(req.params.id, async (err, lesson) => {
      if (err) {
        return res.status(422).send({ error: `Error finding lesson ${req.params.id} -> ${err.message}` })
      }
      return res.status(201).send(lesson)
    })
  }
  
  Lesson.find({}, async (err, lessons) => {
    if (err) {
      return res.status(422).send({ error: `Error retrieving lessons -> ${err.message}` })
    }
    return res.status(201).send(lessons)
  })
}

exports.create = async (req, res, next) => {
  const data = req.body

  Class.find({ _id: { $in: data.classes } }, async (err, classes) => {
    if (err) {
      return res.status(422).send({ error: `Error finding classes -> ${err.message}` })
    } else if (classes.length !== data.classes.length) {
      return res.status(422).send({ error: 'Class doesn\'t exist' })
    }

    const lesson = new Lesson(data)

    try {
      await lesson.save()
      return res.status(201).send(lesson)
    } catch (e) {
      return res.status(422).send({ error: `Error creating lesson -> ${e.message}` })
    }  
  })
}
