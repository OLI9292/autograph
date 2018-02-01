const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

var factoidSchema = new Schema({
  value: { type: String, required: true },
  word: { type: String, required: true },
  secondaryWords: [String],
  level: { type: Number, min: 1, max: 10 },
  citation: { type: String, required: true }
})

const Factoid = mongoose.model('Factoid', factoidSchema)

module.exports = Factoid
