const mongoose = require("mongoose");
const _ = require("underscore");

const Word = require("../models/word");
const Root = require("../models/root");

const logger = require("../config/logger");

//
// CREATE
//

exports.create = async (req, res, next) => {
  const data = req.body;

  if (data.length) {
    const results = await Promise.all(data.map(createWord));
    const errors = results.filter(r => r.error).map(r => r.error);
    const words = results.filter(r => _.isUndefined(r.error));
    Root.createOrUpdateMultiple(words);
    return res.status(201).send({ errors: errors, successes: words });
  } else {
    const response = await createWord(data);

    if (response.error) {
      return res.status(422).send(response);
    } else {
      Root.createOrUpdateMultiple([response]);
      return res.status(201).send(response);
    }
  }
};

const createWord = async data => {
  try {
    const existing = await Word.findOne({ value: data.value });
    if (existing) {
      return { error: "Word already exists." };
    }
  } catch (error) {
    return { error: error.message };
  }

  const word = new Word(data);

  try {
    await word.save();
    return word;
  } catch (error) {
    return { error: error.message };
  }
};

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {
    Word.findById(req.params.id, async (error, word) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      return word
        ? res.status(200).send(word)
        : res.status(404).send({ error: "Not found." });
    });
  } else if (req.query.root) {
    Root.findOne({ value: req.query.root }, async (error, _root) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }
      if (!_root) {
        return res.status(422).send({ error: "Not found." });
      }

      Word.find({ roots: _root._id }, (error, words) => {
        return error
          ? res.status(422).send({ error: error.message })
          : res.status(200).send(words);
      });
    });
  } else {
    var start = new Date();
    var end = new Date();

    Word.find({}, (error, words) => {
      var seconds = (end.getTime() - start.getTime()) / 1000;
      console.log(seconds)
      console.log(words.length)
      return error
        ? res.status(400).send({ error: error.message })
        : res.status(200).send(words);
    });
  }
};

exports.relatedWords = (req, res, next) => {
  const data = req.query.words;

  if (data) {
    const values = data.split(",");

    Word.find({ value: { $in: values } }, (error, words) => {
      if (error) {
        return res.status(422).send({ error: error.message });
      }

      const roots = _.unique(_.flatten(_.pluck(words, "roots")));

      Word.find({ roots: { $in: roots } }, (error, words) => {
        if (error) {
          return res.status(422).send({ error: error.message });
        }

        const [searched, related] = _.partition(words, w =>
          _.contains(values, w.value)
        );

        const result = {};

        searched.forEach(s => {
          result[s.value] = related
            .filter(
              r =>
                _.intersection(
                  r.roots.map(x => x.toString()),
                  s.roots.map(x => x.toString())
                ).length > 0
            )
            .map(r => r.value);
        });

        const arr = [];

        _.keys(result).forEach(k => {
          arr.push({
            word: k,
            related: result[k]
          });
        });

        return res.status(200).send(arr);
      });
    });
  } else {
    return res.status(422).send({ error: "Array of words required." });
  }
};

//
// UPDATE
//

exports.update = (req, res, next) => {
  Word.update({ _id: req.params.id }, req.body, async (error, word) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    return word.n > 0
      ? res.status(200).send(req.body)
      : res.status(422).send({ error: "Not found." });
  });
};

//
// DELETE
//

exports.delete = (req, res, next) => {
  Word.findOneAndRemove({ _id: req.params.id }, async (error, word) => {
    if (error) {
      return res.status(422).send({ error: error.message });
    }

    if (word) {
      Root.update(
        { words: word._id },
        { $pull: { words: word._id } },
        { multi: true }
      );
      return res.status(200).send(word);
    } else {
      return res.status(404).send({ error: "Not found." });
    }
  });
};
