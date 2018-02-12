const mongoose = require('mongoose')
const _ = require('underscore')
const { chunk } = require('lodash');
const { flatmap } = require('../lib/helpers')

const Questions = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Lesson = require('../models/lesson')
const Root = require('../models/root')
const User = require('../models/user')

const levelDoc = async levelId => {
  return Level.findById(levelId, async (error, level) => {
    if (error) { return { error: error.message } }
    return level || { error: 'Level not found.' }
  })  
} 

const lessonDoc = async id => {
  return Lesson.findById(id, async (error, lesson) => {
    if (error) { return { error: error.message } }
    return lesson || { error: 'Lesson not found.' }
  })  
} 

const userDoc = async userId => {
  return User.findById(userId, async (error, user) => {
    if (error) { return { error: error.message } }
    return user || { error: 'User not found.' }
  })  
}

const wordDocs = async () => {
  return Word.find({}, async (error, words) => {
    if (error) { return { error: error.message } }
    return words || { error: 'Words not found.' }
  })  
}

const rootDocs = async (word) => {
  return Root.find({}, async (error, roots) => {
    if (error) { return { error: error.message } }
    return roots || { error: 'Roots not found.' }
  })  
}

const randomWords = (user, level, harcodedWords, allWords) => {
  const totalCount = harcodedWords.length * (1 / (level.ratios.seen + level.ratios.unseen));
  const [seenCount, unseenCount] = [level.ratios.seen, level.ratios.unseen].map(r => Math.round(r * totalCount));
  const seenWords = _.pluck(_.sample(_.reject(user.words, w => _.contains(harcodedWords, w.name)), seenCount), 'name');
  const unseenWords = _.pluck(_.sample(_.reject(allWords, w => _.contains(harcodedWords.concat(seenWords), w.value)), unseenCount), 'value');
  return seenWords.concat(unseenWords);
}

const spTrain = async (user, level, stage, allWords, allRoots) => {
  const progressBars = level.progressBars;
  const stageWordCount = level.words.length / progressBars;

  const harcoded = chunk(level.words, stageWordCount)[stage - 1];
  const random = randomWords(user, level, harcoded, allWords);
  const sectionWords = harcoded.concat(random);

  const questionData = _.compact(_.map(sectionWords, (word, idx) => {
    const wordDoc = _.find(allWords, w => w.value === word);
    const userWord = _.find(user.words, w => w.name === word);
    const level = userWord ? userWord.experience : 1;
    return wordDoc && { level: level, word: wordDoc };
  }));

  return await Questions(questionData, allWords, allRoots);
}

const spExplore = async (user, words, allWords, allRoots) => {
  const questionData = _.compact(_.map(words, (word, idx) => {
    const wordDoc = _.find(allWords, w => w.value === word);
    const userWord = _.find(user.words, w => w.name === word);
    const level = userWord ? userWord.experience : 1;
    return wordDoc && { level: level, word: wordDoc };
  }));

  return await Questions(questionData, allWords, allRoots);
}

const questions = {
  forTrainLevel: async (levelId, userId, stage) => {
    if (!levelId || !userId || !stage) { return { error: 'Invalid params.' } }

    const level = await levelDoc(levelId)
    const user = await userDoc(userId)
    const words = await wordDocs()
    const roots = await rootDocs()

    const errored = _.find([user, level, words, roots], d => d.error)
    if (errored) { return { error: errored.error } }      

    return spTrain(user, level, stage, words, roots)
  },

  forSpeedLevel: async obscurity => {
    if (!_.contains(_.range(1,11), obscurity)) { return { error: 'Invalid params.'} }

    const words = await wordDocs()
    const roots = await rootDocs()
    
    const wordsForObscurity = _.filter(words, w => w.obscurity === obscurity)
    const data = _.map(wordsForObscurity, w => ({ word: w, level: obscurity }))

    return await Questions(data, words, roots)
  },

  forExploreLevel: async (userId, words) => {
    const user = await userDoc(userId)
    const allWords = await wordDocs()
    const allRoots = await rootDocs()

    const errored = _.find([user, allWords, allRoots], d => d.error)
    if (errored) { return { error: errored.error } }      

    return spExplore(user, words, allWords, allRoots)    
  },

  forReadLevel: async id => {
    const lesson = await lessonDoc(id)
    const allWords = await wordDocs()
    const allRoots = await rootDocs()

    const errored = _.find([lesson, allWords, allRoots], d => d.error)
    
    _.each(lesson.questions, q => q.word = _.find(allWords, w => w.value === q.word))
    const data = _.map(lesson.questions, q => _.extend({}, q, { level: 'sentenceCompletion' }))
    
    return await Questions(data, allWords, allRoots)
  }  
}

exports.read = async (req, res, next) => {
  let result

  switch(req.query.type) {
  case 'train':
    result = await questions.forTrainLevel(req.query.id, req.query.user_id, req.query.stage)
    break
  case 'speed':
    result = await questions.forSpeedLevel(parseInt(req.query.id, 10))
    break
  case 'explore':
    result = await questions.forExploreLevel(req.query.user_id, req.query.words.split(','))
    break
  case 'read':
    result = await questions.forReadLevel(req.query.id)
    break    
  default:
    result = { error: 'Invalid type.' }
  }

  return result.error
      ? res.status(422).send({ error: result.error })
      : res.status(200).send(result)
}
