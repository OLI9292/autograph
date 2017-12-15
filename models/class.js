const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const classSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  name: { type: String, required: true },
  students: {
    type: [Schema.Types.ObjectId],
    default: []
  }
})

const Class = mongoose.model('Class', classSchema)

module.exports = Class
