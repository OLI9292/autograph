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
  } else if (req.query.teacher) {
    Class.find({ teacher: req.query.teacher }, async (err, classes) => {
      if (err) {
        return res.status(422).send({ error: `Error finding classes -> ${err.message}` })
      }
      
      Lesson.find({ classes: { "$in": _.pluck(classes, '_id') }}, async (err, lessons) => {
        if (err) {
          return res.status(422).send({ error: `Error finding lessons -> ${err.message}` })
        }

        return res.status(201).send(lessons)
      })  
    })    
  } else {
    Lesson.find({}, async (err, lessons) => {
      if (err) {
        return res.status(422).send({ error: `Error retrieving lessons -> ${err.message}` })
      }
      return res.status(201).send(lessons)
    })
  }
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

exports.delete = async (req, res, next) => {
  Lesson.findOneAndRemove({ _id: req.params.id }, async (err, removed) => {
    if (err) {
      return res.status(422).send({ error: `Error retrieving lesson -> ${err.message}` })
    }

    return removed
      ? res.status(201).send(removed)
      : res.status(422).send({ error: `Could not find lesson (${req.params.id})` })
  })  
}
