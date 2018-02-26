const mongoose = require('mongoose')
const _ = require('underscore')
const { chunk, get } = require('lodash');

const Questions = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Lesson = require('../models/lesson')
const Root = require('../models/root')
const User = require('../models/user')

const randomWordCounts = (level, hardcoded) => {
  const { seen, unseen } = level.ratios
  const totalCount = hardcoded.length / (1 - seen - unseen)
  return _.map([seen, unseen], r => Math.round(r * totalCount))
}

const wordPool = (user, wordDocs) => {
  const userWords = _.pluck(user.words, 'name') 
  return _.partition(wordDocs, w => _.contains(userWords, w.value))
}

const addWordTo = async (words, pool, daisyChain = false) => {
  const values = _.pluck(words, 'value')
  const filtered = _.reject(pool, w => _.contains(values, w.value))
  if (_.isEmpty(filtered)) { console.log('Pool is empty'); return words; }

  const lastWord = _.last(words)

  if (daisyChain && lastWord) {
    const matches = await lastWord.sharesRootWith()
    const match = _.find(matches, m => _.contains(_.pluck(filtered, 'value'), m.value))
    if (match) { return words.concat(match); }
  }

  return words.concat(_.sample(filtered))
}

const randomWords = async (user, level, hardcoded, wordDocs) => {
  const [seenCount, unseenCount] = randomWordCounts(level, hardcoded)
  const totalCount = seenCount + unseenCount
  const [seenWords, unseenWords] = wordPool(user, wordDocs)

  const range = _.range(1, (totalCount + 1))
  let arr = []

  for (let n of range) {
    const pool = n <= seenCount ? seenWords : unseenWords
    arr = await addWordTo(arr, pool, true)
    if (n === totalCount) { return _.pluck(arr, 'value'); }
  }
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
    const hardcoded = wordsForStage(level, stage)
    const random = await randomWords(user, level, hardcoded, words)
    const all = _.union(hardcoded, random)
    const questionData = wordsAndLevels(all, words, user)
    return await Questions(questionData, words, roots)
  },

  forExploreLevel: async (data, questionLevel) => {
    const { level, user, words, roots } = data
    const questionData = wordsAndLevels(level.words, words, user, questionLevel)
    return await Questions(questionData, words, roots)
  },  

  forSpeedLevel: async data => {
    const { level, user, words, roots } = data
    const hardcoded = level.words
    const random = _.sample(_.pluck(user.words, 'name'), hardcoded.length)
    const all = _.shuffle(_.uniq(_.union(hardcoded, random)))
    const questionData = wordsAndLevels(all, words, user)
    return await Questions(questionData, words, roots)
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
    case 'speed':   return await questions.forSpeedLevel(data)
    default:        return { error: 'Invalid type.' }
    }
  })()

  return result.length
    ? res.status(200).send(result)
    : res.status(422).send({ error: result.error || 'No questions.' });
}
