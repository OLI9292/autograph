const _ = require('underscore')

const Word = require('../models/word')
const WordList = require('../models/wordList')

//
// CREATE
//

exports.create = async (req, res, next) => {
  const data = req.body
  const words = _.pluck(data.questions, 'word')

  Word.find({ value: { $in: words } }, async (error, words) => {
    if (error) { return res.status(422).send({ error: error.message }) }
    if (!words.length) { return res.status(422).send({ error: 'No words found.' }) }

    data.questions = data.questions.filter((q) => _.contains(_.pluck(words, 'value'), q.word))

    const wordList = new WordList(data)
    
    try {
      await wordList.save()
      return res.status(201).send(wordList)     
    } catch (error) {
      return res.status(422).send({ error: error.message })
    }    
  })
}

//
// READ
//

exports.read = (req, res, next) => {
  if (req.params.id) {

    WordList.findById(req.params.id, (error, wordList) => {

      if (error) { return res.status(422).send({ error: error.message }) }

      return wordList
        ? res.status(200).send(wordList)
        : res.status(422).send({ error: 'Not found.' })
    })

  } else {

    WordList.find({}, (error, wordLists) => {
      return error
        ? res.status(422).send({ error: error.message })
        : res.status(200).send(wordLists)
    })

  }
}

//
// UPDATE
//

exports.update = async (req, res, next) => {
  WordList.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, async (error, wordList) => {
    if (error) { return res.status(422).send({ error: error.message }) }

    return wordList
      ? res.status(200).send(wordList)
      : res.status(422).send({ error: 'Not found.' })
  })  
}

//
// DELETE
//

exports.delete = async (req, res, next) => {
  WordList.findOneAndRemove({ _id: req.params.id }, (error, removed) => {
    if (error) { return res.status(422).send({ error: error.message }) } 

    return removed
      ? res.status(201).send(removed)
      : res.status(422).send({ error: 'Not found.' })
  })  
}
