const moment = require('moment')
const mongoose = require('mongoose')
const _ = require('underscore')
const { chunk, get } = require('lodash');

const { createQuestions, getQuestions } = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Root = require('../models/root')
const User = require('../models/user')
const { Question } = require('../models/question')

const demoWords = require('../lib/demoWords')

// look in models/question
const SPELL_TYPES = [6, 7, 8, 10]
const BUTTON_TYPES = _.difference(_.range(1, 11), SPELL_TYPES)

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

const wordsAndLevels = (words, user, questionLevel) => {
  return _.map(words, word => {
    const userWord = user && _.find(user.words, w => w.name === word)
    const level = questionLevel
      ? _.isArray(questionLevel) ? _.sample(questionLevel) : questionLevel
      : userWord ? userWord.experience : 1
    return { word: word, level: level }
  })
}

const wordsForStage = (level, stage) => {
  const wordsPerStage = level.words.length / level.progressBars
  return chunk(level.words, wordsPerStage)[stage - 1]
}

const questions = {
  forDemoLevel: async () => {
    const data = wordsAndLevels(demoWords, null, 1)
    return await getQuestions(data)
  },

  forTrainLevel: async params => {
    const { level, user, stage } = params
    const words = await Word.find({})
    const hardcoded = wordsForStage(level, stage)
    const random = await randomWords(user, level, hardcoded, words)
    const all = _.union(hardcoded, random)
    const data = wordsAndLevels(all, user)
    return await getQuestions(data)
  },

  forExploreLevel: async params => {
    const { level, questionLevel, user } = params
    const data = wordsAndLevels(_.shuffle(level.words), user, questionLevel)
    return await getQuestions(data)
  },  

  forSpeedLevel: async params => {
    const { level, user } = params
    const hardcoded = level.words
    const random = _.sample(_.pluck(user.words, 'name'), hardcoded.length)
    const all = _.shuffle(_.uniq(_.union(hardcoded, random)))
    const questionLevels = get(level.speed, 'inputType') === 'spell' ? SPELL_TYPES : BUTTON_TYPES
    const data = wordsAndLevels(level.words, user, questionLevels)
    return await getQuestions(data)
  },

  forMultiplayerLevel: async params => {
    const { seed, user } = params
    const data = wordsAndLevels(_.shuffle(seed.split(',')), user)
    return await getQuestions(data)
  }  
}

const questionParams = async query => {
  const { id, questionLevel, seed, stage, user_id } = query

  const level = await Level.doc(id)
  const user = await User.doc(user_id)
  
  return {
    level: level,
    questionLevel: questionLevel,
    stage: stage,
    seed: seed,
    user: user
  }
}

const timeSince = start => moment.duration(moment().diff(start))._data

exports.read = async (req, res, next) => {
  const start = moment()

  const params = await questionParams(req.query)
  
  const result = await (async () => {
    switch (req.query.type) {
    case 'demo':        return await questions.forDemoLevel()
    case 'train':       return await questions.forTrainLevel(params)
    case 'explore':     return await questions.forExploreLevel(params, start)
    case 'speed':       return await questions.forSpeedLevel(params)
    case 'multiplayer': return await questions.forMultiplayerLevel(params)
    default:            return { error: 'Invalid type.' }
    }
  })()

  return result.length
    ? res.status(200).send(result)
    : res.status(422).send({ error: result.error || 'No questions.' });
}

exports.all = async () => {
  const words = await Word.docs()
  const roots = await Root.docs()
  const levels = _.range(1, 11)
  const data = _.flatten(_.map(words, word => _.map(levels, level => ({ word: word, level: level }))))
  return await createQuestions(data, words, roots)
}

exports.create = async (req, res, next) => {
  const { questions, level } = req.body

  const docs = _.map(questions, q => (new Question({ key: `test-${level}`, data: JSON.stringify(q) })))
  
  Question.collection.insert(docs, (err, docs) => {
    return err
      ? res.status(422).send('Error: ' + err.message)
      : res.status(201).send('Saved ' + get(docs, 'insertedCount') + ' docs succesfully.')
  })
}
