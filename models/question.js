const mongoose = require('mongoose')
const _ = require('underscore')

const Word = require('./word')
const Root = require('./root')

const CHOICES_COUNT = 6
const SPELL_CHOICES_COUNT = 12
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

const redHerrings = (all, reject, type) => {
  switch (type) {
    case 'roots' || 'words':
      return _.sample(_.reject(_.pluck(all, 'value'), a => _.contains(reject, a)), CHOICES_COUNT - reject.length)
    case 'wordDefinitions':
      return _.sample(_.map(_.reject(all, a => a.value === reject.value), w => w.fullDefinition()), CHOICES_COUNT - 1)
    case 'spell':
      return _.sample(_.reject('abcdefghijklmnopqrstuvwxyz'.split(''), c => _.contains(reject, c)), CHOICES_COUNT - reject.length)
    default:
      return []
  }
}

const addHintToRoot = (value, roots) => {
  const rootDoc = _.find(roots, r => r.value === value)
  return {
    value: value,
    hint: rootDoc && rootDoc.definitions[0]
  }
}

const addHintToRootDef = (value, roots) => {
  const rootDoc = _.find(roots, r => _.contains(r.definitions, value))
  return {
    value: value,
    hint: rootDoc && rootDoc.value
  }
}

const defToRoots = async (roots, words, word, cutToOneRoot = false) => {
  const prompt = word.prompts()

  let rootIndices = _.without(_.map(word.components, (c, i) => c.componentType === 'root' && i), false);
  if (cutToOneRoot) { rootIndices = [_.sample(rootIndices)]; }
  
  const answer = _.map(word.components, (c, i) => ({ value: c.value, missing: _.contains(rootIndices, i) }))
  const answerValues = _.pluck(_.filter(answer, a => a.missing), 'value')

  const redHerrings = _.sample(_.reject(roots, r => _.contains(answerValues, r.value)), CHOICES_COUNT - answerValues.length)
  const choices = _.shuffle(_.map(answerValues.concat(_.pluck(redHerrings, 'value')), v => addHintToRoot(v, roots)))

  return { prompt: prompt, answer: answer, choices: choices, word: word.value }
}

const defToChars = async (roots, words, word, cutToOneRoot = false) => {
  const prompt = word.prompts()
  const rootComponents = cutToOneRoot ? word.rootComponents(true) : word.rootComponents()

  const answer = _.flatten(_.map(word.components, c => {
    const missing = _.some(rootComponents, r => _.isEqual(r, c))
    return _.map(c.value.split(''), char => ({ value: char, missing: missing }))
  }))
  
  const answerValues = _.pluck(_.filter(answer, a => a.missing), 'value')
  const redHerrings = _.sample(_.shuffle(_.filter(ALPHABET, char => !_.contains(answerValues, char))), SPELL_CHOICES_COUNT - answerValues.length)
  const choices = _.shuffle(_.map(answerValues.concat(redHerrings), c => ({ value: c })))

  return {
    prompt: prompt,
    answer: answer,
    choices: choices,
    word: word.value
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
  const choices = _.shuffle(_.map(redHerrings, c => ({ value: c.definitions[0], hint: c.value })).concat(params.answer))

  return {
    prompt: params.prompt,
    answer: [{ value: params.answer.value, missing: true }],
    choices: choices,
    word: word.value
  }
}

// Level 4 (no default highlight on client)

const defToAllRootsNoHighlight = (...args) => defToAllRoots(...args)

// Level 5

const defToWord = (roots, words, word) => {
  const prompt = word.prompts()

  const answer = { value: word.value, missing: true };
  // todo: - remove redHerrings method
  const choices = _.shuffle(_.map(redHerrings(words, [word.value], 'roots').concat(word.value), c => ({ value: c })))

  return {
    prompt: prompt,
    answer: [answer],
    choices: choices,
    word: word.value
  }
}

// Level 6

const defToCharsOneRoot = (...args) => defToChars(...args, true)

// Level 7

const wordToDef = (roots, words, word) => {
  const prompt = { normal: [{ value: word.value, highlight: false }] };
  const answer = { value: word.fullDefinition(), missing: true }
  const redHerrings = _.map(_.sample(_.reject(words, w => w.value === word.value), 3), w => ({ value: w.fullDefinition() }))
  const choices = _.shuffle([_.pick(answer, 'value')].concat(redHerrings))

  return {
    prompt: prompt,
    answer: [answer],
    choices: choices,
    word: word.value
  }
}

// Level 8

const defToCharsAllRoots = (...args) => defToChars(...args)

// Level 9

const wordDefToRootDef = (roots, words, word) => {
  const _root = word.rootComponents(true)[0]; // TODO validate _root

  const prompt = _.flatten([
    { value: 'What is the meaning of the highlighted root in ', highlighted: false },
    _.map(word.components, c => ({ value: c.value, highlight: _root.value === c.value })),
    { value: '?', highlighted: false }
  ])
  
  const answer = { value: _root.definition, missing: true }
  const redHerrings = _.map(_.sample(_.reject(roots, r => r.value === _root.value), CHOICES_COUNT - 1), r => _.pick(r, 'value'))
  const choices = _.shuffle([_.pick(answer, 'value')].concat(redHerrings))

  return {
    prompt: prompt,
    answer: [answer],
    choices: choices ,
    word: word.value
  } 
}

const TYPES = {
  '1': [defToOneRoot],
  '2': [defToAllRoots],
  '3': [defCompletion],
  '4': [defToAllRootsNoHighlight],
  '5': [defToWord],
  '6': [defToCharsOneRoot],
  '7': [wordToDef],
  '8': [defToCharsAllRoots],
  '9': [wordDefToRootDef],
  '10': [defToRoots]
}

const type = level => TYPES[level][0].name

module.exports = async (data, words, roots) => { 
  if (_.isArray(data)) {
    const questions = await Promise.all(_.map(data, elem => _.sample(TYPES[elem.level])(roots, words, elem.word)))
    return _.map(questions, (q, i) => _.extend({}, q, { type: type(data[i].level), word: data[i].word.value }))
  } else {
    const question = await _.sample(TYPES[data.level])(roots, words, data.word)
    return _.extend({}, question, { type: type(data.level), word: data.word.value })
  }
}
