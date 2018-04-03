const mongoose = require("mongoose");
const _ = require("underscore");

const Level = require("../models/level");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const level = new Level(req.body);

  try {
    await level.save();
    return res.status(201).send(level);
  } catch (error) {
    return res.status(422).send({ error: error });
  }
};

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {
    Level.findById(req.params.id, async (error, level) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return level
        ? res.status(200).send(level)
        : res.status(422).send({ error: "Not found." });
    });
  } else {
    Level.find({}, (error, levels) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(levels);
    });
  }
};

//
// UPDATE
//

exports.update = (req, res, next) => {
  Level.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    async (error, level) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return level
        ? res.status(200).send(level)
        : res.status(422).send({ error: "Not found." });
    }
  );
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  Level.findOneAndRemove({ _id: req.params.id }, async (error, removed) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return removed
      ? res.status(200).send(removed)
      : res.status(422).send({ error: "Not found." });
  });
};
