const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const _ = require("underscore");

const identifierValidator = objs => {
  const split = objs.split(".");
  return split.length === 3 && _.every(split, str => parseInt(str, 10) > 0);
}

const question2Schema = new Schema({
  identifier: {
    type: String,
    required: true,
    validate: {
      validator: identifierValidator,
      message: "Identifier requires a #.#.# format."
    }       
  },
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
    required: true,
    validate: {
      validator: objs => _.every(objs, obj => obj.filter(c => c.correct).length > 0),
      message: "Choice layers require one correct answer."
    }    
  },
});

const Question2 = db.model("Question2", question2Schema);

module.exports = Question2;
