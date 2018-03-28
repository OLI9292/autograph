const mongoose = require('mongoose')
const _ = require('underscore')

const Class = require('../models/class')
const User = require('../models/user')

const sampleSize = require('lodash/sampleSize')

//
// CREATE
//

exports.create = async (req, res, next) => {
  const users = req.body
  
  const [teacher, students] = _.partition(users, u => u.isTeacher)
  if ((teacher.length !== 1) || (students.length <= 1)) {
    return res.status(422).send({ error: 'Classes require 1 teacher and multiple students.' })
  }

  const usernames = _.pluck(await User.find({}, 'email'), 'email')
  const _class = new Class()
  
  // add attributes
  _.forEach(users, u => {
    u.signUpMethod = 'teacherSignUp'
    const role = u.isTeacher ? 'teacher' : 'student'
    u.classes = [{ id: _class.id, role: role }]
    // generate a unique username and random password for students (not teacher)
    if (!u.isTeacher) {
      const base = (u.firstName + u.lastName.charAt(0)).toLowerCase()
      u.email = usernameWithIndex(base, usernames)
      u.password = generatePassword()      
    }
  })

  // create users & class
  User.insertMany(users, (error, docs) => {
    if (error) { return res.status(422).send({ error: error.message }) }
    
    const [teacher, students] = _.partition(docs, doc => doc.isTeacher)
    _class.teacher = _.pluck(teacher, '_id')[0]
    _class.students = _.pluck(students, '_id')
    
    _class.save(error => {
      if (error) {
        User.remove({ _id: { $in: _.pluck(docs, '_id') } })
        return res.status(422).send({ error: error.message })
      } else {
        return res.status(201).send({
          class: _class,
          students: students,
          teacher: teacher[0]
        })
      }
    })
  })
}

const usernameWithIndex = (base, usernames) => {
  const matches = _.map(_.filter(usernames, u => u.startsWith(base)), u => u.replace(base, ''))
  let index = 1
  if (matches.length) {
    const numbers = _.filter(_.map(matches, m => parseInt(m, 10)), m => _.isNumber(m))
    index += Math.max(...numbers)
  }
  return base + index
}

const generatePassword = () => sampleSize('abcdefghkmnpqrstuvwxyz23456789', 10).join('')

//
// READ
//

exports.read = async (req, res, next) => {
  if (req.params.id) {
    
    Class.findById(req.params.id, async (error, _class) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(_class)
    })

  } else if (req.query.teacher) {

    Class.find({ teacher: req.query.teacher }, async (error, classes) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(classes)
    })    

  } else {
    
    Class.find({}, async (error, classes) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(classes)
    })    

  }
}

exports.readStudents = async (req, res, next) => {
  Class.findById(req.params.id, async (error, _class) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    if (_class) {
      User.find({ _id: { $in: _class.students } }, async (err, students) => {
        if (error) { return res.status(422).send({ error: error.message }) }

        return res.status(201).send(students)
      })  
    } else {
      return res.status(422).send({ error: 'Class not found.' })
    }
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

//
// UPDATE
//

exports.update = async (req, res, next) => {
  Class.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, async (error, _class) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return _class
      ? res.status(200).send(_class)
      : res.status(422).send({ error: 'Not found.' })
  })
}

//
// DELETE
//

exports.delete = async (req, res, next) => {
  Class.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: 'Not found' })
  })  
}
