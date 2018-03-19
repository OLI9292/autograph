const _ = require('underscore')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { get } = require('lodash')

const db = require('../databases/accounts/index')

const QuestionController = require('../controllers/question')
const { Question } = require('../models/question')

exports.cache = async () => {
  const questions = await QuestionController.all()
  const docs = questions.map(q => (new Question({ key: q.key, data: JSON.stringify(q) })))
  await Question.remove({})
  
  Question.collection.insert(docs, (err, docs) => {
    err
      ? console.log('Error: ' + err)
      : console.log('Saved ' + get(docs, 'insertedCount') + ' docs succesfully.')
    return    
  })
}
