const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const choiceSetSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  choices: { 
    type: [
      {
        value: { type: String, required: true },
        level: { type: Number, required: true, min: 1, max: 20 }
      }
    ],
    required: true,
    validate: {
      validator: objs => objs.length > 1,
      message: "Minimum 2 choices required."
    }      
  }
});

const ChoiceSet = db.model("ChoiceSet", choiceSetSchema);

module.exports = ChoiceSet;
