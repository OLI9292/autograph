const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const _ = require("underscore");


const question2Schema = new Schema({
  identifier: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  prompt: { 
    type: [
      {
        value: String,
        highlight: Boolean
      }
    ],
    required: true
  },
  secondaryPrompt: { 
    type: [
      {
        value: String,
        highlight: Boolean
      }
    ]
  },
  choices: { 
    type: [
      [
        {
          value: String,
          correct: Boolean
        }
      ]
    ],
    required: true
  },
});

const Question2 = db.model("Question2", question2Schema);

module.exports = Question2;
