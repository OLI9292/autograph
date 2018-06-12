const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const choiceTreeSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 1, max: 20 },
  json: { type: String, required: true }
});

const ChoiceTree = db.model("ChoiceTree", choiceTreeSchema);

module.exports = ChoiceTree;
