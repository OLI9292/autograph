const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')
const { get } = require('lodash');

const db = require('../databases/accounts/index')
const Word = require('./word')
const Root = require('./root')

const CHOICES_COUNT = 6
const SPELL_CHOICES_COUNT = 12
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

const { capitalize, upcase } = require('../lib/helpers')

const defToRoots = async (roots, words, word, cutToOneRoot = false) => {
  const prompt = word.prompts()

  const wordRoots = word.rootComponents(cutToOneRoot)
  const answer = _.map(word.components, c => ({ value: c.value, missing: _.some(wordRoots, r => _.isEqual(r, c)) }))
  const answerChoices = _.map(wordRoots, r => ({ value: r.value, hint: r.definition }))

  const redHerrings = _.sample(_.reject(roots, r => _.contains(_.pluck(answerChoices, 'value'), r.value)), CHOICES_COUNT - answerChoices.length)
  const choices = _.map(redHerrings, h => ({ value: h.value, hint: _.sample(h.definitions) })).concat(answerChoices)
  choices.forEach(c => c.value = upcase(c.value))

  return { prompt: prompt, answer: answer, choices: choices }
}

const defToChars = async (roots, words, word, cutToOneRoot = false) => {
  const prompt = word.prompts()
  const rootComponents = cutToOneRoot ? word.rootComponents(true) : word.rootComponents()

  const answer = _.flatten(_.map(word.components, c => {
    const missing = _.some(rootComponents, r => _.isEqual(r, c))
    return _.map(c.value.split(''), char => ({ value: char, missing: missing }))
  }))
  
  const answerValues = _.uniq(_.pluck(_.filter(answer, a => a.missing), 'value'))
  const redHerringsCount = SPELL_CHOICES_COUNT - answerValues.length
  const redHerrings = _.sample(_.filter(ALPHABET, char => !_.contains(answerValues, char)), redHerringsCount)
  const choices = _.map(answerValues.concat(redHerrings).sort(), c => ({ value: c }))
  choices.forEach(c => c.value = upcase(c.value))

  return {
    prompt: prompt,
    answer: answer,
    choices: choices
  }
}

// Level 1

const defToOneRoot = async (...args) => await defToRoots(...args, true)

// Level 2

const defToAllRoots = async (...args) => await defToRoots(...args)

// Level 3

const defCompletion = (roots, words, word) => {
  const wordRoots = _.filter(roots, r => word.roots.some(wr => wr.equals(r._id)))
  
  const params = word.defCompletionParams(wordRoots);
  const redHerrings = _.sample(_.reject(roots, r => r.value === params.answer.hint), 5)
  const choices = _.map(redHerrings, c => ({ value: c.definitions[0], hint: c.value })).concat(params.answer)
  choices.forEach(c => c.hint = upcase(c.hint))

  return {
    prompt: params.prompt,
    answer: [{ value: params.answer.value, missing: true }],
    choices: choices
  }
}

// Level 4 (no default highlight on client)

const defToAllRootsNoHighlight = async (...args) => await defToAllRoots(...args)

// Level 5

const defToWord = (roots, words, word) => {
  const prompt = word.prompts()

  const answer = { value: word.value, missing: true };
  const choices = _.map(_.sample(_.reject(words, w => w.value === answer.value, 'value'), 5).concat(answer), c => _.pick(c, 'value'))

  return {
    prompt: prompt,
    answer: [answer],
    choices: choices
  }
}

// Level 6

const defToCharsOneRoot = async (...args) => await defToChars(...args, true)

// Level 8

const defToCharsAllRoots = async (...args) => await defToChars(...args)

// Level 9

const rootInWordToDef = (roots, words, word) => {
  const _root = word.rootComponents(true)[0]; // TODO validate _root

  const normalPrompt = _.flatten([
    { value: 'What is the meaning of the highlighted root?', highlighted: false },
    { value: '<br />', highlighted: false },
    _.map(word.components, c => ({
      value: _root.value === c.value ? c.value.toUpperCase() : c.value,
      highlight: _root.value === c.value 
    }))
  ])

  const easyPrompt = normalPrompt.concat({ value: ` = ${word.fullDefinition()}`, highlight: false })
  const prompts = { normal: normalPrompt, easy: easyPrompt }
  
  const answer = { value: _root.definition, missing: true }
  const redHerrings = _.map(_.sample(_.reject(roots, r => r.value === _root.value), 5), r => ({ value: r.definitions[0], hint: r.value }))
  const choices = redHerrings.concat({ value: answer.value, hint: _root.value })
  choices.forEach(c => c.hint = upcase(c.hint))

  return {
    prompt: prompts,
    answer: [answer],
    choices: choices
  } 
}

// Level 10 (no default highlight on client)

const defToCharsAllRootsNoHighlight = async (...args) => await defToCharsAllRoots(...args)

const TYPES = {
  '1': [defToOneRoot],
  '2': [defToAllRoots],
  '3': [defCompletion],
  '4': [defToAllRootsNoHighlight],
  '5': [defToWord],
  '6': [defToCharsOneRoot],
  '7': [defToCharsOneRoot], // Repeat
  '8': [defToCharsAllRoots],
  '9': [rootInWordToDef],
  '10': [defToCharsAllRootsNoHighlight]
}

const SPELL_TYPES = [6, 7, 8, 10]
const BUTTON_TYPES = _.difference(_.range(1, 11), SPELL_TYPES)

// Question Model
var questionSchema = new Schema({
  key: { type: String, required: true },
  data: { type: String, required: true }
})

const Question = db.model('Question', questionSchema)
exports.Question = Question

// Create every possible question daily via script
exports.createQuestions = async (data, words, roots) => { 
  const promises = _.map(data, async elem => {
    const { level, word } = elem
    const wordValue = get(word, 'value')
    try {
      const question = await _.sample(TYPES[1])(roots, words, word)
      return _.extend({}, question, {
        level: level,
        word: wordValue,
        key: wordValue + '-' + level,
        type: TYPES[level][0].name,
        choices: _.contains(SPELL_TYPES, level) ? question.choices : _.shuffle(question.choices)        
      })
    } catch (error) {
      return { error: { message: get(word, 'value') + ' - ' + error.message } }
    }
  })

  let [questions, errors] = _.partition((await Promise.all(promises)), elem => !elem.error);  
  console.log({ errors: errors.length ? errors : 'none' })
  return questions
}

// Get question via array of [word, level]
exports.getQuestions = async data => { 
  const keys = _.map(data, elem => elem.word + '-' + elem.level)
  let questions = await Question.find({ key: { $in: keys } })
  return _.map(questions, question => JSON.parse(question.data))
}
