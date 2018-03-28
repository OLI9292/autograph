const db = require('../databases/accounts/index')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const classSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  school: Schema.Types.ObjectId,
  name: { type: String },
  students: {
    type: [Schema.Types.ObjectId],
    default: []
  }
})

const Class = db.model('Class', classSchema)

module.exports = Class
