const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const levelSchema = new Schema({
  ladder: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  progressBars: { type: Number, min: 1, max: 10 },
  ratios: {
    type: {
      seen: Number, // validate
      unseen: Number // validate
    }
  },
  seededBy: { type: String, enum: ['manual', 'root'] },
  slug: { type: String, required: true }, // unique
  type: { type: String, required: true, enum: ['train', 'general', 'topic', 'speed'] },
  speed: {
    type: {
      time: { type: Number, min: 1, max: 15, default: 3 },
      inputType: { type: String, enum: ['button', 'spell'], default: 'button' }
    }
  },
  words: [String]
})

const Level = mongoose.model('Level', levelSchema)

module.exports = Level
