const db = require('../databases/accounts/index')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

var wordListSchema = new Schema({
  name: { type: String, required: true },
  category: String,
  updatedOn: { type: String, required: true },
  description: String,
  questions: {
    type: [
      {
        word: { type: String, required: true },
        difficulty: { type: Number, min: 0, max: 2, default: 0 }
      }
    ],
    default: [],
  },
  isStudy: { type: Boolean, required: true, default: true }
})

const WordList = db.model('WordList', wordListSchema)

module.exports = WordList
