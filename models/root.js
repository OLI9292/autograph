const db = require("../databases/accounts/index");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const _ = require("underscore");

const notEmptyValidator = objType => {
  const validator = objs => objs.length !== 0;
  return {
    validator: validator,
    msg: `Please add at least one object to the ${objType} array`
  };
};

var rootSchema = new Schema({
  value: { type: String, required: true },
  definitions: {
    type: [String],
    required: true,
    validate: [notEmptyValidator]
  },
  words: [Schema.Types.ObjectId]
});

const update = async (existing, obj, wordId) => {
  const definitions = _.union(existing.definitions, [obj.definition]);
  const words = _.union(existing.words, [wordId]);

  existing.set({ definitions: definitions, words: words });

  try {
    return await existing.save();
  } catch (err) {
    return { message: `Error updating root ${existing.value}` };
  }
};

const create = async (obj, wordId) => {
  const newRoot = new Root({
    value: obj.value,
    definitions: [obj.definition],
    words: [wordId]
  });
  try {
    return await newRoot.save();
  } catch (err) {
    return { message: `Error creating root ${obj.value}` };
  }
};

rootSchema.statics.findByValue = async value => {
  return Root.findOne({ value: value }, (err, doc) => {
    err ? { message: `Error querying root ${value}` } : doc;
  });
};

rootSchema.statics.createOrUpdate = async (obj, wordId) => {
  const existing = await Root.findByValue(obj.value);
  return existing
    ? await update(existing, obj, wordId)
    : await create(obj, wordId);
};

rootSchema.statics.createOrUpdateForWord = async (objs, wordId) => {
  return Promise.all(objs.map(o => Root.createOrUpdate(o, wordId)));
};

rootSchema.statics.createOrUpdateMultiple = async words => {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    const rootComponents = word.components.filter(
      c => c.componentType === "root"
    );

    const roots = await Root.createOrUpdateForWord(rootComponents, word._id);
    const error = _.find(roots, r => r && r.message);

    if (error) {
      OLOG.error(error.message);
    } else {
      word.set({ roots: _.pluck(roots, "_id") });
      try {
        await word.save();
      } catch (error) {
        // TODO: - look into error here
        OLOG.error(error.message);
      }
    }
  }
};

const Root = db.model("Root", rootSchema);

module.exports = Root;
