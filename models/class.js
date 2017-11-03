const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const classSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  name: String,
  students: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  lessons: {
    type: [Schema.Types.ObjectId],
    default: []    
  }
})

const Class = mongoose.model('Class', classSchema)

module.exports = Class
