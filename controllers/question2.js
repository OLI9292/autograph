const mongoose = require("mongoose");
const _ = require("underscore");

const Question2 = require("../models/question2");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const question2 = new Question2(req.body);

  try {
    await question2.save();
    return res.status(201).send(question2);
  } catch (error) {
    return res.status(422).send({ error: error });
  }
};

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {
    Question2.findById(req.params.id, async (error, question2) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return question2
        ? res.status(200).send(question2)
        : res.status(422).send({ error: "Not found." });
    });
  } else {
    Question2.find({}, (error, question2s) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(question2s);
    });
  }
};

//
// UPDATE
//

exports.update = (req, res, next) => {
  Question2.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    async (error, question2) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return question2
        ? res.status(200).send(question2)
        : res.status(422).send({ error: "Not found." });
    }
  );
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  Question2.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: "Not found." });
  });
};
