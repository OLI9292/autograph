const _ = require('underscore')

const Lesson = require('../models/lesson')
const Class = require('../models/class')

//
// CREATE
//

exports.create = async (req, res, next) => {
  const data = req.body
  
  if (data.classes) {

    Class.find({ _id: { $in: data.classes } }, async (error, classes) => {
      if (error) { return res.status(422).send({ error: error.message }) }
      
      if (classes.length !== data.classes.length) {
        return res.status(422).send({ error: 'Class doesn\'t exist' })
      }

      const lesson = new Lesson(data)

      try {
        await lesson.save()
        return res.status(201).send(lesson)
      } catch (error) {
        return res.status(422).send({ error: error.message })
      }  
    })
  } else {
    return res.status(422).send({ error: 'Class array required.' }) 
  }
}

//
// READ
//

exports.read = async (req, res, next) => {
  if (req.params.id) {
    
    Lesson.findById(req.params.id, async (error, lesson) => {
      if (error) { 
        return res.status(422).send({ error: error.message })
      } else if (lesson) {
        return res.status(201).send(lesson)
      } else {
        return res.status(422).send({ error: 'Lesson not found.' })
      }
    })

  } else if (req.query.teacher) {

    Class.find({ teacher: req.query.teacher }, async (error, classes) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      Lesson.find({}, async (error, lessons) => {
        if (error) { return res.status(422).send({ error: error.message }) }
        
        return res.status(201).send(lessons);
      })
    })

  } else if (req.query.student) {
    const query = req.query.student === 'anon' ? {} : { students: req.query.student };
    
    Class.find(query, async (error, classes) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      Lesson.find({}, async (error, lessons) => {
        if (error) { return res.status(422).send({ error: error.message }) }

        lessons = lessons.filter((l) => l.public || _.intersection(l.classes, _.pluck(classes, '_id')))

        return res.status(201).send(lessons);
      })    
    })

  } else {
    
    Lesson.find({}, async (error, lessons) => {
      if (error) { return res.status(422).send({ error: error.message }) }
      return res.status(201).send(lessons)
    })
  }
}

//
// UPDATE
//

exports.update = async (req, res, next) => {
  Lesson.update({ _id: req.params.id }, req.body, async (error, lesson) => {
    if (error) {
      return res.status(422).send({ error: error.message })
    } else if (lesson) {
      return res.status(201).send(lesson)
    } else {
      return res.status(422).send({ error: 'Not found.' })
    }
  })
}

//
// DELETE
//

exports.delete = async (req, res, next) => {
  Lesson.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message })
    } else if (removed) {
      return res.status(201).send(removed)
    } else {
      return res.status(422).send({ error: 'Not found.' })
    }
  })  
}
