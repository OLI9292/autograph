const mongoose = require('mongoose')
const _ = require('underscore')

const Word = require('./word')
const Root = require('./root')

const CHOICES_COUNT = 6

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

const defToRoots = async (params, cutToOneRoot = false, highlightRootDefs = true) => {
  const {
    roots, word, words
  } = params

  const prompt = word.fullDefinition()

  let rootIndices = _.without(_.map(word.components, (c, i) => c.componentType === 'root' && i), false);
  if (cutToOneRoot) { rootIndices = [_.sample(rootIndices)]; }
  const answer = _.map(word.components, (c, i) => ({ value: c.value, missing: _.contains(rootIndices, i) }))

  const answerValues = _.pluck(_.filter(answer, a => a.missing), 'value')
  const redHerrings = _.sample(_.reject(roots, r => _.contains(answerValues, r.value)), CHOICES_COUNT - answerValues.length)
  const choices = _.map(answerValues.concat(_.pluck(redHerrings, 'value')), v => addHintToRoot(v, roots))

  return { prompt: prompt, easyPrompt: word.definition, answer: answer, choices: choices }
}

const defToChars = async (params, cutToOneRoot = false) => {
  const { word, words } = params

  const prompt = word.value
  let roots = _.filter(word.components, c => c.componentType === 'root')
  if (cutToOneRoot) { roots = [_.sample(roots)] }
  const answers = _.uniq(_.flatten(_.map(roots, r => r.value.split(''))));
  const choices = answers.concat(redHerrings(null, answers, 'spell'))

  return { prompt: prompt, answers: answers, choices: choices }
}


// Level 1

const defToOneRoot = params => defToRoots(params, true)

// Level 2

const defToAllRoots = params => defToRoots(params)

// Level 3

const defCompletion = params => {
  const {
    roots, word, words
  } = params

  const wordRoots = _.filter(roots, r => word.roots.some(wr => wr.equals(r._id)))
  
  const result = word.hideRootInDef(wordRoots);

  if (result) {
    const prompt = `${word.value} is ${result.definition}`
    const answer = { value: result.answer.value, missing: true };
    const redHerrings = _.sample(_.reject(roots, r => r.value === result.answer.value), 5)
    const choices = _.map(redHerrings, c => ({ value: c.definitions[0], hint: c.value })).concat(result.answer)
    return { prompt: prompt, answers: [answer], choices: choices }
  }
}

// Level 4

const defToAllRootsNoHighlight = params => defToRoots(params, false, false)

// Level 5

const defToWord = params => {
  const {
    roots, word, words
  } = params

  const prompt = word.fullDefinition()
  const easyPrompt = word.easyDefinition();
  const answers = [word.value];
  const choices = answers.concat(redHerrings(words, answers, 'roots'))

  return { prompt: prompt, easyPrompt: easyPrompt, answers: answers, choices: choices }
}

// Level 6

const defToCharsOneRoot = params => defToChars(params, true)

// Level 7

const wordToDef = params => {
  const {
    roots, word, words
  } = params

  const prompt = word.value;
  const answers = [word.fullDefinition()];
  const choices = answers.concat(redHerrings(words, word, 'wordDefinitions'))

  return { prompt: prompt, answers: answers, choices: choices }
}

// Level 8

const defToCharsAllRoots = params => defToChars(params)

// Level 9

const wordDefToRootDef = params => {}

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

module.exports = async (data, words, roots) => { 
  return _.isArray(data)
  ?
  Promise.all(_.map(data, elem => _.sample(TYPES[elem.level])({
    roots: roots,
    word: elem.word,
    words: words
  })))
  :
  (await _.sample(TYPES[data.level])({
    roots: roots,
    word: data.word,
    words: words
  }))
}
