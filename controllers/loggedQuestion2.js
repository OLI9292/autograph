const mongoose = require("mongoose")

const LoggedQuestion2 = require("../models/loggedQuestion2")

//
// CREATE
//

exports.create = async (req, res, next) => {
  const results = await Promise.all(req.body.map(createLoggedQuestion2))
  return res.status(201).send(results)
}

const createLoggedQuestion2 = async data => {
  try {
    const loggedQuestion2 = new LoggedQuestion2(data)
    await loggedQuestion2.save()
    return loggedQuestion2
  } catch (error) {
    return { error: error.message }
  }
}

//
// READ
//

exports.read = async (req, res, next) => {
  LoggedQuestion2.find({}, async (error, data) => res
    .status(error ? 422 : 200)
    .send(error ? { error: error.message } : data))
}
