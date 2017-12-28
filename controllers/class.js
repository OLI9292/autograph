const mongoose = require('mongoose')
const _ = require('underscore')

const Class = require('../models/class')
const School = require('../models/school')
const User = require('../models/user')

//
// CREATE
//

exports.create = (req, res, next) => {
  const data = req.body
  const teacher = data.teacher

  if (teacher) {
    User.findById(teacher, async (error, teacher) => {
      if (error) { return res.status(422).send({ error: error.message }) }

      if (teacher) {
        try {
          const _class = new Class(data)
          teacher.isTeacher = true
          teacher.classes.push({ id: _class._id, role: 'teacher' })
          await teacher.save()
          await _class.save()
          return res.status(201).send(_class)
        } catch (error) {
          return res.status(422).send({ error: error.message })
        }
      } else {
        return res.status(422).send({ error: 'Teacher not found.' })
      }      
    }) 
  } else {
    return res.status(422).send({ error: 'Create class requires a teacher id' })
  }
}

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

const getLeaderboard = students => {
  return _.sortBy(students
    .map((s) => {
      return {
        _id: s._id,
        name: s.fullName(),
        score: _.reduce(s.words, (acc, w) => acc + w.experience, 0)
      }
    }), 'score')
    .reverse()
}

exports.leaderboards = async (req, res, next) => {
  try {
    const classes = await Class.find()
    const allStudents = await User.find()
    
    const _class = _.find(classes, (c) => c.id === req.params.id)
    if (!_class || !_class.school) { return res.status(404).send({ error: 'Not found.' }) }

    const school = await School.findById(_class.school)
    if (!school) { return res.status(404).send({ error: 'Not found.' }) }

    const ids = _.flatten(classes.filter((c) => c.school === _class.school).map((c) => c.students))
    const fellowStudents = allStudents.filter((s) => ids.contains(s._id))

    const leaderboards = {}
    leaderboards.earth = getLeaderboard(allStudents)
    leaderboards[school.name] = getLeaderboard(fellowStudents)

    return res.status(200).send(leaderboards)
  } catch (error) {
    return res.status(422).send({ error: error.message })
  }
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
