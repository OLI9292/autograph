const mongoose = require('mongoose')
const _ = require('underscore')

const Class = require('../models/class')
const User = require('../models/user')

exports.read = async (req, res, next) => {
  if (_.has(req.params, 'id')) {
    Class.findById(req.params.id, async (err, klass) => {
      if (err) {
        return res.status(422).send({ error: `Error finding class ${req.params.id} -> ${err.message}` })
      }
      return res.status(201).send({ class: klass })
    })
  } else if (_.isEmpty(req.query)) {
    Class.find({}, async (err, classes) => {
      if (err) {
        return res.status(422).send({ error: `Error retrieving classes -> ${err.message}` })
      }
      return res.status(201).send({ count: classes.length, classes: classes })
    })
  } else {
    return res.status(422).send({ error: 'Unsupported class query' })    
  }
}

exports.create = (req, res, next) => {
  if (!_.has(req.query, 'teacherId')) {
    return res.status(422).send({ error: 'Create class requires a valid teacher id' })
  }

  User.findById(req.query.teacherId, async (err, user) => {
    if (err) {
      return res.status(422).send({ error: `Error finding user ${req.params.id} -> ${err.message}` })
    }
    const klass = new Class({ teacher: user._id })
    try {
      await klass.save()
      user.isTeacher = true
      user.classes.push({ id: klass._id, role: 'teacher' })
      await user.save()
      return res.status(201).send({ success: true, class: klass, teacher: user })
    } catch (e) {
      let message = `Error creating class (teacherId: ${req.params.teacherId}) -> ${e.message}`
      console.log(message)
      return { error: message }
    }
    return res.status(422).send({ error: 'Could not find teacher' })
  })    
}

exports.join = async (req, res, next) => {
  const classId = req.params.id
  const students = req.body.students

  if (_.isUndefined(classId)) {
    return res.status(422).send({ error: 'Join class requires a valid class id' })
  } else if (_.isUndefined(students)) {
    return res.status(422).send({ error: 'Join class requires student ids' })
  }

  await Class.findById(classId, (err, klass) => {
    if (err) {
      return res.status(422).send({ error: `Error finding class ${classId} -> ${err.message}` })
    } else if (_.isNull(klass)) {
      return res.status(422).send({ error: `Class ${classId} does not exist` })
    }

    User.find({ _id: { $in: students } }, async (err, students) => {
      if (err) {
        return res.status(422).send({ error: `Error finding students -> ${err.message}` })
      } else {
        const newStudents = _.reject(students, (s) => klass.students.some((o) => o.equals(s._id)))

        await newStudents.forEach(async (n) => {
          if (!_.some(n.classes, (c) => c.equals(classId))) {
            n.classes.push({ id: classId, role: 'student' })
            await n.save()
          }
        })

        _.pluck(newStudents, '_id').forEach((id) => klass.students.push(id))
        await klass.save()

        return res.status(201).send({ success: true, class: klass })
      }
    });
  })
}

exports.delete = (req, res, next) => {
  Class.remove({}, async (err) => {
    if (err) {
      let message = `Error deleting classes -> ${err.message}`
      console.log(message)
      return res.status(422).send({ error: message })
    }
    return res.status(201).send('Deleted all classes')
  })
}
