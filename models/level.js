const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const logger = require('../config/logger')

const levelSchema = new Schema({
  words: [String],
  ladder: { type: Number, required: true, min: 0 },
  progressBars: { type: Number, required: true, min: 1, max: 10 },
  slug: { type: String, required: true }, // unique
  ratios: {
    type: {
      seen: Number, // validate
      unseen: Number // validate
    }
  },
  name: { type: String, required: true },
  type: { type: String, required: true },
  length: Number
})

const Level = mongoose.model('Level', levelSchema)

module.exports = Level
