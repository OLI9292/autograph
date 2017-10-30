const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const lessonSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  name: String,
  students: {
    type: [Schema.Types.ObjectId],
    default: []
  }
})

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = Lesson
