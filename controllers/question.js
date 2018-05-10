const moment = require("moment");
const mongoose = require("mongoose");
const _ = require("underscore");
const { chunk, get } = require("lodash");

const { createQuestions, getQuestions } = require("../models/question");
const Word = require("../models/word");
const Level = require("../models/level");
const Root = require("../models/root");
const User = require("../models/user");
const { Question } = require("../models/question");
const cache = require("../cache");

const demoWords = require("../lib/demoWords");

// look in models/question
const SPELL_TYPES = [6, 7, 8, 10];
const BUTTON_TYPES = _.difference(_.range(1, 11), SPELL_TYPES);

const BATTLE_SEEN_WORDS_RATIO = 0.75;

const randomWordCounts = (level, hardcoded) => {
  const { seen, unseen } = level.ratios;
  const totalCount = hardcoded.length / (1 - seen - unseen);
  return _.map([seen, unseen], r => Math.round(r * totalCount));
};

const addWordTo = (words, pool, daisyChain = false) => {
  const available = _.shuffle(_.reject(pool, word => _.pluck(words, "value").includes(word.value)));

  if (_.isEmpty(available)) {
    console.log("Pool is empty.");
    return words;
  }

  const lastWord = _.last(words);

  let nextWord =
    daisyChain &&
    lastWord && 
    _.find(available, word => lastWord.sharesRoot.includes(word.value));

  if (!nextWord) { nextWord = _.sample(available); }

  return words.concat(nextWord);
};

const wordPool = (user, wordDocs) => {
  const userWords = _.pluck(user.words, "name");
  return _.partition(wordDocs, w => _.contains(userWords, w.value));
};

const randomWords = (user, level, hardcoded, wordDocs) => {
  const [seenCount, unseenCount] = randomWordCounts(level, hardcoded);
  const totalCount = seenCount + unseenCount;
  const [seenWords, unseenWords] = wordPool(user, wordDocs);

  const range = _.range(1, totalCount + 1);
  let arr = [];

  for (let n of range) {
    const pool = n <= seenCount ? seenWords : unseenWords;
    arr = addWordTo(arr, pool, true);
    if (n === totalCount) {
      return _.pluck(arr, "value");
    }
  }
};

const wordsAndLevels = (words, user, questionLevel) => {
  return _.map(words, word => {
    const userWord = user && _.find(user.words, w => w.name === word);
    const level = questionLevel
      ? _.isArray(questionLevel) ? _.sample(questionLevel) : questionLevel
      : userWord ? userWord.experience : 1;
    return { word: word, level: level };
  });
};

const wordsForStage = (level, stage) => {
  const wordsPerStage = level.words.length / level.progressBars;
  return chunk(level.words, wordsPerStage)[stage - 1];
};

const trainData = async (level, stage, user) => {
  if (!stage) { console.log("No stage provided."); return; }

  const hardcoded = wordsForStage(level, stage);

  return new Promise(resolve => {
    cache.get("words", async (error, reply) => {
      if (error || !reply) {
        console.log(get(error, "message") || "No reply for words.");
        return;
      }
      
      const words = reply
        ? JSON.parse(reply)
        : (await Word.find({}, { value: 1, sharesRoot: 1 }));

      if (!reply) {
        cache.set("words", JSON.stringify(words));
      }
      
      const random = await randomWords(user, level, hardcoded, words);
      const all = _.union(hardcoded, random);
      const data = wordsAndLevels(all, user);
      resolve(data);
    })
  });  
};

const speedData = (level, user) => {
  const hardcoded = level.words;
  const random = _.sample(_.pluck(user.words, "name"), hardcoded.length);
  const all = _.shuffle(_.uniq(_.union(hardcoded, random)));
  const questionLevels = get(level.speed, "inputType") === "spell" ? SPELL_TYPES : BUTTON_TYPES;
  return wordsAndLevels(level.words, user, questionLevels);  
}

const randomWordsAndLevels = async (user, questionsCount) => {
  const seenWords = _.pluck(_.sample(user.words, Math.round(questionsCount * BATTLE_SEEN_WORDS_RATIO)), "name")
  const unseenWordsCount = questionsCount - seenWords.length;
  const unseenWords = unseenWordsCount.length > 0 ?
    await Word.find(
      { value: { $nin: seenWords }},
      { value: 1 }
    ).limit(unseenWordsCount) : [];
  const words = seenWords.concat(_.pluck(unseenWords, "value"));
  return wordsAndLevels(words, user);
}

const questions = async params => {
  const {
    level,
    questionLevel,
    questionsCount,
    stage,
    seed,
    user,
    type
  } = params;

  if (!["demo", "train", "speed", "multiplayer", "battle"].includes(type)) { 
    return { error: "Invalid type."};
  }

  let data;

  if (type === "demo")        { data = wordsAndLevels(demoWords, null, 1); }
  if (type === "train")       { data = await trainData(level, stage, user); }
  if (type === "speed")       { data = speedData(level, user); }
  if (type === "multiplayer") { data = wordsAndLevels(_.shuffle(seed.split(",")), user); }
  if (type === "battle")      { data = await randomWordsAndLevels(user, questionsCount); }

  return await getQuestions(data);
};

const questionParams = async query => {
  const { id, questionLevel, seed, stage, user_id, type, questions_count } = query;

  try {
    const level = await Level.findById(id);
    const user = await User.findById(user_id);
    
    if (id && !level) { return { error: "Level not found."}; }
    if (user_id && !user) { return { error: "User not found."}; }
    
    return { 
      level: level,
      questionLevel: questionLevel,
      questionsCount: parseInt(questions_count, 10) || 15,
      stage: stage,
      seed: seed,
      user: user,
      type: type
    };    
  } catch (error) {
    return { error: error.message };
  }
};

const timeSince = start => moment.duration(moment().diff(start)).asMilliseconds();

exports.read = async (req, res, next) => {
  const params = await questionParams(req.query);

  if (params.error) { return res.status(422).send(params); }

  const result = await questions(params);

  return result.length
    ? res.status(200).send(result)
    : res.status(422).send({ error: result.error || "No questions." });
};

exports.all = async () => {
  const words = await Word.docs();
  const roots = await Root.docs();
  const levels = _.range(1, 11);
  const data = _.flatten(
    _.map(words, word => _.map(levels, level => ({ word: word, level: level })))
  );
  return await createQuestions(data, words, roots);
};

exports.create = async (req, res, next) => {
  const { questions, level } = req.body;

  const docs = _.map(
    questions,
    q => new Question({ key: `test-${level}`, data: JSON.stringify(q) })
  );

  Question.collection.insert(docs, (err, docs) => {
    return err
      ? res.status(422).send("Error: " + err.message)
      : res
          .status(201)
          .send("Saved " + get(docs, "insertedCount") + " docs succesfully.");
  });
};
