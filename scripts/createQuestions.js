const _ = require('underscore')
const mongoose = require('mongoose')

const cache = require('../cache')
const QuestionController = require('../controllers/question')

module.exports.cache = async () => {
  let questions = await QuestionController.all()
  questions = _.flatten(questions.map(q => [`${q.word}-${q.level}`, JSON.stringify(q)]))
  // Cache questions
  console.log({ level: 'info', message: `Saving ${questions.length / 2} questions.` })
  cache.hmset(...['questions', questions])

  // Close connections
  if (process.env.NODE_ENV !== 'test') { mongoose.connection.close(); }
  cache.unref()

  return
}
