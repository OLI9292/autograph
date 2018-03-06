const _ = require('underscore')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { get } = require('lodash')

const db = require('../databases/accounts/index')

const QuestionController = require('../controllers/question')

var questionSchema = new Schema({
  key: { type: String, required: true },
  data: { type: String, required: true }
})

const Question = db.model('Question', questionSchema)

module.exports.cache = async () => {
  const questions = await QuestionController.all()
  const docs = questions.map(q => (new Question({ key: q.key, data: JSON.stringify(q) })))

  await Question.remove({})

  Question.collection.insert(docs, (err, docs) => {
    if (err) {
      console.log('Error: ' + err)
    } else {
      console.log('Saved ' + get(docs, 'insertedCount') + ' docs succesfully.')
    }

    if (process.env.NODE_ENV !== 'test') { mongoose.connection.close(); }
    return    
  })
}
