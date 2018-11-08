const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loggedQuestion2Schema = new Schema({
  questionCategory: { type: String, required: true },
  questionSubCategory: String,
  questionIdentifier: { type: String, required: true },
  questionPrompt: String,
  questionSecondaryPrompt: String,
  startTime: { type: String, required: true },
  endTime: String,
  secondsTaken: Number,
  guesses: String,
  userId: { type: String, required: true },
  email: { type: String, required: true },
  correct: { type: Boolean, required: true },
  finished: { type: Boolean, required: true }
});

const LoggedQuestion2 = db.model("LoggedQuestion2", loggedQuestion2Schema);

module.exports = LoggedQuestion2;
