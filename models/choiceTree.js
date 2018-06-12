const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const choiceTreeSchema = new Schema({
  name: { type: String, required: true },
  json: { type: String, required: true }
});

const ChoiceTree = db.model("ChoiceTree", choiceTreeSchema);

module.exports = ChoiceTree;
