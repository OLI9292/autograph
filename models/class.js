const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const _ = require("underscore");
const User = require("./user");

const classSchema = new Schema({
  teacher: Schema.Types.ObjectId,
  school: Schema.Types.ObjectId,
  name: { type: String },
  students: {
    type: [Schema.Types.ObjectId],
    default: []
  }
});

classSchema.methods.studentDocs = async function() { 
  return await User.find(
    { _id: { $in: this.students } },
    { firstName: 1, lastName: 1, totalWordsLearned: 1, totalTimeSpent: 1 }
  );
};

const Class = db.model("Class", classSchema);

module.exports = Class;
