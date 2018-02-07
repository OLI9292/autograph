const mongoose = require('mongoose')
const _ = require('underscore')
const { chunk } = require('lodash');
const { flatmap } = require('../lib/helpers')

const Questions = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Root = require('../models/root')
const User = require('../models/user')

const demos = require('../lib/demoLevels')

const levelDoc = async levelId => {
  return Level.findById(levelId, async (error, level) => {
    if (error) { return { error: error.message } }
    return level || { error: 'Level not found.' }
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

const singlePlayer = async (user, level, allWords, allRoots) => {
  // level, if words not empty, divide the length of words by the progress bar, 
  const userLevel = _.find(user.levels, l => l.slug === level.slug);
  const userProgress = userLevel ? userLevel.progress : 0;
  const progressBars = level.progressBars;

  if (level.words.length) {
    const levelWordCount = level.words.length / progressBars;
    const harcoded = chunk(level.words, levelWordCount)[userProgress];
    const random = randomWords(user, level, harcoded, allWords);
    const sectionWords = harcoded.concat(random);

    const questionData = _.compact(_.map(sectionWords, word => {
      const wordDoc = _.find(allWords, w => w.value === word);
      const userWord = _.find(user.words, w => w.name === word);
      const level = userWord ? userWord.experience : 1;
      return wordDoc && { level: level, word: wordDoc };
    }));

    return await Questions(questionData, allWords, allRoots);
  }
}

const questions = {
  forDemoLevel: async level => {
    const words = await wordDocs()
    const roots = await rootDocs()

    const data = _.filter(_.map(demos[level] || [], q => ({
      word: _.find(words, w => w.value === q.word),
      level: q.level
    })), d => d.word)

    return await Questions(data, words, roots)
  },

  forTrainLevel: async (levelId, userId) => {
    const level = await levelDoc(levelId)
    const user = await userDoc(userId)
    const words = await wordDocs()
    const roots = await rootDocs()

    if (user.error || level.error  || words.error) { return { error: _.find([user, level, words], d => d.error).error } }
    return singlePlayer(user, level, words, roots)
  },

  forSpeedLevel: async obscurity => {
    if (!_.contains(_.range(1,11), obscurity)) { return { error: 'Invalid obscurity.'} }
    const words = await wordDocs()
    const roots = await rootDocs()
    
    const wordsForObscurity = _.filter(words, w => w.obscurity == obscurity)
    const data = _.map(wordsForObscurity, w => ({ word: w, level: obscurity }))

    return await Questions(data, words, roots)
  }
}

exports.read = async (req, res, next) => {
  let result

  switch(req.query.type) {
  case 'demo':
    result = await questions.forDemoLevel(parseInt(req.query.id, 10))
    break    
  case 'train':
    result = await questions.forTrainLevel(req.query.id, req.query.user_id)
    break
  case 'speed':
    result = await questions.forSpeedLevel(parseInt(req.query.id, 10))
    break
  default:
    result = { error: 'Invalid type.' }
  }

  return result.error
      ? res.status(422).send({ error: result.error })
      : res.status(200).send(result)
}
