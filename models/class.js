const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const classSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  students: [Schema.Types.ObjectId]
})

const Class = mongoose.model('Class', classSchema)

module.exports = Class
