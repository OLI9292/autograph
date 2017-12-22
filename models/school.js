const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

const schoolSchema = new Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String
})

const School = mongoose.model('School', schoolSchema)

module.exports = School
