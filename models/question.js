const mongoose = require('mongoose')
const _ = require('underscore')
const { get } = require('lodash');

const Word = require('./word')
const Root = require('./root')
const cache = require('../cache')

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

  return { prompt: prompt, answer: answer, choices: choices, word: word.value }
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

const defToOneRoot = (...args) => defToRoots(...args, true)

// Level 2

const defToAllRoots = (...args) => defToRoots(...args)

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

const defToAllRootsNoHighlight = (...args) => defToAllRoots(...args)

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

const defToCharsOneRoot = (...args) => defToChars(...args, true)

// Level 7

/*const wordToDef = (roots, words, word) => {
  const prompt = { normal: [{ value: capitalize(word.value), highlight: false }] };

  const answer = { value: word.fullDefinition(), missing: true }
  const redHerrings = _.map(_.sample(_.reject(words, w => w.value === word.value), 3), w => ({ value: w.fullDefinition() }))
  const choices = redHerrings.concat(_.pick(answer, 'value'))

  return {
    prompt: prompt,
    answer: [answer],
    choices: choices
  }
}*/

// Level 8

const defToCharsAllRoots = (...args) => defToChars(...args)

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

const defToCharsAllRootsNoHighlight = (...args) => defToCharsAllRoots(...args)


/*const sentenceCompletion = (roots, words, word, context) => {
  const underscores = word.value.split('').fill('_').join('')
  const normalPrompt = [{ value: context.replace(word.value, underscores), highlight: false }]

  const redHerrings =  _.sample(_.reject(words, w => w.value === word.value), 5);
  const choices = redHerrings.concat({ value: word.value })

  return {
    prompt: { normal: normalPrompt },
    answer: [{ value: word.value, missing: true }],
    choices: choices
  }
}*/

const TYPES = {
  '1': [defToOneRoot],
  '2': [defToAllRoots],
  '3': [defCompletion],
  '4': [defToAllRootsNoHighlight],
  '5': [defToWord],
  '6': [defToCharsOneRoot],
  '7': [defToCharsOneRoot],
  '8': [defToCharsAllRoots],
  '9': [rootInWordToDef],
  '10': [defToCharsAllRootsNoHighlight]
}

const SPELL_TYPES = [6, 7, 8, 10]
const BUTTON_TYPES = _.difference(_.range(1, 11), SPELL_TYPES)

module.exports = async (data, words, roots) => { 
  const oneQuestion = !_.isArray(data)
  if (oneQuestion) { data = [data] }

  cache.hgetall('questions', async (err, cached) => {

    const promises = _.map(data, async elem => {
      try {
        const key = `${get(elem.word, 'value')}-${elem.level}`;
        const key = 'blargg'
        return cached[key]
          ? JSON.parse(cached[key])
          : _.sample(TYPES[elem.level])(roots, words, elem.word)
      } catch (error) {
        return { error: error }
      }
    })

    let questions = _.reject((await Promise.all(promises)), question => question.error)

    // Add type, word, and shuffle choices
    questions = _.map(questions, (q, i) => _.extend({}, q, {
      type: TYPES[data[i].level][0].name,
      level: data[i].level,
      word: data[i].word.value,
      choices: _.contains(SPELL_TYPES, data[i].level) ? q.choices : _.shuffle(q.choices)
    }))

    return oneQuestion ? _.first(questions) : questions
  })
}
