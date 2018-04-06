const mongoose = require("mongoose");
const _ = require("underscore");
const sampleSize = require("lodash/sampleSize");
const get = require("lodash/get");

const Class = require("../models/class");
const User = require("../models/user");
const { login } = require("./login");
const { send } = require("./mail");

//
// CREATE
//

const addAttributesToUser = (user, classId, usernames) => {
  user.signUpMethod = "teacherSignUp";
  const role = user.isTeacher ? "teacher" : "student";
  user.classes = [{ id: classId, role: role }];
  // generate a unique username and random password for students (not teacher)
  if (!user.isTeacher) {
    const base = (user.firstName + user.lastName.charAt(0)).toLowerCase();
    user.email = usernameWithIndex(base, usernames);
    user.password = generatePassword();
  }
  return user;
}

const generatePassword = () =>
  sampleSize("abcdefghkmnpqrstuvwxyz23456789", 10).join("");

const teacherAndStudents = users => [_.find(users, u => u.isTeacher), _.reject(users, u => u.isTeacher)];

// gives the user a unique username = firstName + first letter of lastName + index
const usernameWithIndex = (base, usernames) => {
  const matches = _.map(_.filter(usernames, u => u.startsWith(base)), u =>
    u.replace(base, "")
  );
  const numbers = _.filter(_.map(matches, m => parseInt(m, 10)), m =>
    Number.isInteger(m)
  );
  let index = 1;
  if (numbers.length) {
    index += Math.max(...numbers);
  }
  return base + index;
};

exports.create = async (req, res, next) => {
  let users = req.body;
  const [teacher, students] = teacherAndStudents(users);

  if (!teacher || students.length < 2) {
    return res
      .status(422)
      .send({ error: "Classes require 1 teacher and multiple students." });
  }

  const usernames = await User.existingUsernames();
  const _class = new Class();
  const classId = _class.id;
  users = _.map(users, user => addAttributesToUser(user, classId, usernames));

  User.create(users, (error, docs) => {
    if (error) { return res.status(422).send({ error: error.message }); }

    const [teacherDoc, studentDocs] = teacherAndStudents(docs)
    _class.teacher = get(teacherDoc, "_id");
    _class.students = _.pluck(studentDocs, "_id");

    _class.save(error => {
      if (error) {
        User.remove({ _id: { $in: _.pluck(docs, "_id") } });
        return res.status(422).send({ error: error.message });
      } else {
        if (req.query.login) {
          const params = {
            email: teacher.email,
            password: teacher.password,
            name: teacher.firstName,
            type: "welcome",
            students: teacherAndStudents(users)[1]
          };

          send(params, result =>
            console.log(result.error || `Sent ${result.subject} email to ${result.to}.`)
          );

          return login(teacher.email, teacher.password, result =>
            res.status(result.error ? 422 : 201).send(result)
          );
        }
        
        return res.status(201).send({ class: _class, users: users, students: studentDocs, teacher: teacherDoc });
      }
    });
  });
};

//
// READ
//

exports.read = async (req, res, next) => {
  if (req.params.id) {
    Class.findById(req.params.id, async (error, _class) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(_class);
    });
  } else if (req.query.teacher) {
    Class.find({ teacher: req.query.teacher }, async (error, classes) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(classes);
    });
  } else {
    Class.find({}, async (error, classes) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(classes);
    });
  }
};

exports.readStudents = async (req, res, next) => {
  Class.findById(req.params.id, async (error, _class) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    if (_class) {
      User.find({ _id: { $in: _class.students } }, async (err, students) => {
        if (error) {
          return res.status(422).send({ error: error.message });
        }

        return res.status(201).send(students);
      });
    } else {
      return res.status(422).send({ error: "Class not found." });
    }
  });
};

exports.join = async (req, res, next) => {
  const classId = req.params.id;
  const students = req.body.students;

  if (_.isUndefined(classId)) {
    return res
      .status(422)
      .send({ error: "Join class requires a valid class id" });
  } else if (_.isUndefined(students)) {
    return res.status(422).send({ error: "Join class requires student ids" });
  }

  await Class.findById(classId, (err, klass) => {
    if (err) {
      return res
        .status(422)
        .send({ error: `Error finding class ${classId} -> ${err.message}` });
    } else if (_.isNull(klass)) {
      return res.status(422).send({ error: `Class ${classId} does not exist` });
    }

    User.find({ _id: { $in: students } }, async (err, students) => {
      if (err) {
        return res
          .status(422)
          .send({ error: `Error finding students -> ${err.message}` });
      } else {
        const newStudents = _.reject(students, s =>
          klass.students.some(o => o.equals(s._id))
        );

        await newStudents.forEach(async n => {
          if (!_.some(n.classes, c => c.equals(classId))) {
            n.classes.push({ id: classId, role: "student" });
            await n.save();
          }
        });

        _.pluck(newStudents, "_id").forEach(id => klass.students.push(id));
        await klass.save();

        return res.status(201).send({ success: true, class: klass });
      }
    });
  });
};

//
// UPDATE
//

exports.update = async (req, res, next) => {
  const {
    id
  } = req.params;

  if (req.body.students && req.body.email) {
    const usernames = await User.existingUsernames();
    const users = _.map(req.body.students, user => addAttributesToUser(user, id, usernames));

    User.create(users, (error, userDocs) => {
      if (error) { return res.status(422).send({ error: error.message }); }
      
      const studentIds = _.pluck(userDocs, "_id");

      Class.findOneAndUpdate(
        { _id: id },
        { $push: { students: { $each: studentIds } } }, 
        { new: true },
        (error, doc) => {
        if (error || !doc) {
          User.remove({ _id: { $in: studentIds } });
          const errorMessage = error.message || "Class not found.";
          return res.status(422).send({ error: errorMessage });
        }

        const params = {
          email: req.body.email,
          type: "newAccounts",
          students: users
        };

        send(params, result => console.log(result.error || `Sent new accounts email to ${params.email}.`));        

        return res.status(200).send({ class: doc, newStudents: userDocs });
      });
    });

  } else {

    console.log(1)

    Class.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
      async (error, _class) => {
        if (error) {
          return res.status(422).send({ error: error.message });
        }

        return _class
          ? res.status(200).send(_class)
          : res.status(422).send({ error: "Not found." });
      }
    );

  }
};

//
// DELETE
//

exports.delete = async (req, res, next) => {
  Class.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    if (removed) {
      await User.remove({
        _id: { $in: removed.students.concat(removed.teacher) }
      });
      return res.status(200).send(removed);
    } else {
      return res.status(422).send({ error: "Not found" });
    }
  });
};
