const mongoose = require("mongoose");
const _ = require("underscore");

const ChoiceTree = require("../models/choiceTree");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const choiceTree = new ChoiceTree(req.body);

  try {
    await choiceTree.save();
    return res.status(201).send(choiceTree);
  } catch (error) {
    return res.status(422).send({ error: error });
  }
};

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {
    ChoiceTree.findById(req.params.id, async (error, choiceTree) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return choiceTree
        ? res.status(200).send(choiceTree)
        : res.status(422).send({ error: "Not found." });
    });
  } else {
    ChoiceTree.find({}, (error, choiceTree) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(choiceTree);
    });
  }
};

//
// UPDATE
//

exports.update = (req, res, next) => {
  ChoiceTree.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    async (error, choiceTree) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return choiceTree
        ? res.status(200).send(choiceTree)
        : res.status(422).send({ error: "Not found." });
    }
  );
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  ChoiceTree.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: "Not found." });
  });
};
