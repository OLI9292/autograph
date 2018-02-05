wconst mongoose = require('mongoose')
const _ = require('underscore')
const { chunk } = require('lodash');
const { flatmap } = require('../lib/helpers')

const Questions = require('../models/question')
const Word = require('../models/word')
const Level = require('../models/level')
const Root = require('../models/root')
const User = require('../models/user')

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
  forTrainLevel: async (userId, levelId) => {
    const user = await userDoc(userId)
    const level = await levelDoc(levelId)
    const words = await wordDocs()
    const roots = await rootDocs()

    if (user.error || level.error  || words.error) { return { error: _.find([user, level, words], d => d.error).error } }
    return singlePlayer(user, level, words, roots)
  },

  forSpeedLevel: async (obscurity) => {
    const words = await wordDocs()
    const roots = await rootDocs()
    
    const wordsForObscurity = _.filter(words, w => w.obscurity == obscurity)
    const questionData = _.map(wordsForObscurity, w => ({ word: w, level: obscurity }))

    return await Questions(questionData, words, roots)
  }
}

exports.read = async (req, res, next) => {
  const userId = req.query.user_id
  const trainLevelId = req.query.train_level_id
  const speedLevel = parseInt(req.query.speed_level, 10)

  if (userId && trainLevelId) {
    const result = await questions.forTrainLevel(userId, trainLevelId)

    return result.error
      ? res.status(422).send({ error: result.error })
      : res.status(200).send(result)
  } else if (_.contains(_.range(1, 11), speedLevel))  {
    const result = await questions.forSpeedLevel(speedLevel)
    
    return res.status(200).send(_.shuffle(result))
  }
}
