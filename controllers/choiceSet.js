const mongoose = require("mongoose");
const _ = require("underscore");

const ChoiceSet = require("../models/choiceSet");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const choiceSet = new ChoiceSet(req.body);

  try {
    await choiceSet.save();
    return res.status(201).send(choiceSet);
  } catch (error) {
    return res.status(422).send({ error: error });
  }
};

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {
    ChoiceSet.findById(req.params.id, async (error, choiceSet) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return choiceSet
        ? res.status(200).send(choiceSet)
        : res.status(422).send({ error: "Not found." });
    });
  } else {
    ChoiceSet.find({}, (error, choiceSet) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(choiceSet);
    });
  }
};

//
// UPDATE
//

exports.update = (req, res, next) => {
  ChoiceSet.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    async (error, choiceSet) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return choiceSet
        ? res.status(200).send(choiceSet)
        : res.status(422).send({ error: "Not found." });
    }
  );
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  ChoiceSet.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: "Not found." });
  });
};
