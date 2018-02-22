const mongoose = require('mongoose')
const _ = require('underscore')
const { chunk } = require('lodash');

const Questions = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Lesson = require('../models/lesson')
const Root = require('../models/root')
const User = require('../models/user')

const randomWords = (user, level, harcodedWords, words) => {
  const totalCount = harcodedWords.length * (1 / (level.ratios.seen + level.ratios.unseen));
  const [seenCount, unseenCount] = [level.ratios.seen, level.ratios.unseen].map(r => Math.round(r * totalCount));
  const seenWords = _.pluck(_.sample(_.reject(user.words, w => _.contains(harcodedWords, w.name)), seenCount), 'name');
  const unseenWords = _.pluck(_.sample(_.reject(words, w => _.contains(harcodedWords.concat(seenWords), w.value)), unseenCount), 'value');
  return seenWords.concat(unseenWords);
}

const wordsAndLevels = (wordValues, wordDocs, user, questionLevel) => {
  return _.filter(_.map(_.shuffle(wordValues), word => {
    const doc = _.find(wordDocs, w => w.value === word)
    const userWord = _.find(user.words, w => w.name === word)
    const level = questionLevel
      ? questionLevel
      : userWord ? userWord.experience : 1
    return doc ? { level: level, word: doc } : null
  }), o => o)
}

const wordsForStage = (level, stage) => {
  const wordsPerStage = level.words.length / level.progressBars
  return chunk(level.words, wordsPerStage)[stage - 1]
}

const questions = {
  forTrainLevel: async data => {
    const { level, user, words, roots, stage } = data
    const harcoded = wordsForStage(level, stage)
    const random = randomWords(user, level, harcoded, words)
    const questionData = wordsAndLevels(harcoded.concat(random), words, user)
    return await Questions(questionData, words, roots);
  },

  forExploreLevel: async (data, questionLevel) => {
    const { level, user, words, roots } = data
    const questionData = wordsAndLevels(level.words, words, user, questionLevel)
    return await Questions(questionData, words, roots)
  },  

  forSpeedLevel: async obscurity => {
    const wordsForObscurity = _.filter(words, w => w.obscurity === obscurity)
    const data = _.map(wordsForObscurity, w => ({ word: w, level: obscurity }))
    return await Questions(data, words, roots)
  }
}

const docs = async query => {
  const { id, stage, type, user_id } = query

  const level = await Level.doc(id)
  const user = await User.doc(user_id)
  const words = await Word.docs()
  const roots = await Root.docs()
  
  const data = {
    level: level,
    user: user,
    roots: roots,
    words: words,
    stage: stage || 0
  }

  const errored = _.find(_.keys(data), k => data[k].error)
  return errored ? { error: `Error querying ${errored}.` } : data
}

exports.read = async (req, res, next) => {
  const data = await docs(req.query)
  if (data.error) { res.status(422).send({ error: data.error }); }

  const result = await (async () => {
    switch (req.query.type) {
    case 'train':   return await questions.forTrainLevel(data)
    case 'explore': return await questions.forExploreLevel(data, req.query.questionLevel)
    case 'speed':   return await questions.forSpeedLevel(parseInt(id, 10))
    default:        return { error: 'Invalid type.' }
    }
  })()

  return result.error
    ? res.status(422).send({ error: result.error })
    : res.status(200).send(result)
}
