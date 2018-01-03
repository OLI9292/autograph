require('../db')
const _ = require('underscore')
const mongoose = require('mongoose')

const Class = require('../models/class');
const Lesson = require('../models/lesson');
const School = require('../models/school');
const User = require('../models/user');

const classData = require('../test/mocks/class');
const lessonData = require('../test/mocks/lesson');
const schoolData = require('../test/mocks/school');
const userData = require('../test/mocks/user');

const cleanCollections = async () => Promise.all([Class, Lesson, School, User].map(coll => coll.remove()))

const seedCollections = async () => {
  const data = [
    { model: Class, mocks: classData.mocks },
    { model: Lesson, mocks: lessonData.mocks },
    { model: School, mocks: schoolData.mocks },
    { model: User, mocks: userData.mocks }
  ]
  const documents = _.flatten(data.map(d => d.mocks.map(m => (new d.model(m)).save())))
  return Promise.all(documents)
}

const seedDB = async () => {
  await cleanCollections()
  await seedCollections()
  return
}

module.exports = {
  cleanDB: cleanCollections,
  seedDB: seedDB
}
