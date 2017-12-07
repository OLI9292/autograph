const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const lessonSchema = new Schema({
  name: { type: String, required: true },
  filenames: [String],
  updatedOn: { type: String, required: true },
  questions: {
    type: {
      word: { type: String, required: true },
      context: { type: String, required: true },
      related: { type: [String], default: [] }
    },
    default: []
  },
  classes: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  public: { type: Boolean, default: false }
})

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = Lesson
