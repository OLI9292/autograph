const db = require('../databases/accounts/index')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

var factoidSchema = new Schema({
  value: { type: String, required: true },
  words: [String],
  excludedWords: [String],
  lastEditedBy: String,
  language: String,
  imageSource: String,
  imageCitation: String,
  imageCaption: String,
  publicDomain: { type: Boolean, default: false },
  imagePublicDomain: { type: Boolean, default: false },
  level: { type: Number, min: 1, max: 10 },
  citation: String
})

const Factoid = db.model('Factoid', factoidSchema)

module.exports = Factoid
