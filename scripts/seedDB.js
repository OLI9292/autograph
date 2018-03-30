require("../databases/accounts/index");
const _ = require("underscore");
const mongoose = require("mongoose");

const Class = require("../models/class");
const School = require("../models/school");
const User = require("../models/user");
const Root = require("../models/root");
const Word = require("../models/word");
const Level = require("../models/level");

const classData = require("../test/mocks/class");
const schoolData = require("../test/mocks/school");
const userData = require("../test/mocks/user");
const wordData = require("../test/mocks/word");
const levelData = require("../test/mocks/level");
const rootData = require("../test/mocks/root");

const collections = [
  { model: School, mocks: schoolData.mocks },
  { model: Class, mocks: classData.mocks },
  { model: User, mocks: userData.mocks },
  { model: Word, mocks: wordData.mocks },
  { model: Level, mocks: levelData.mocks },
  { model: Root, mocks: rootData.mocks }
];

const cleanCollections = async () =>
  Promise.all(_.pluck(collections, "model").map(coll => coll.remove()));

const seedCollections = async () => {
  const docs = _.flatten(
    collections.map(d => d.mocks.map(m => new d.model(m).save()))
  );
  return Promise.all(docs);
};

const seedDB = async () => {
  await cleanCollections();
  await seedCollections();
  return;
};

module.exports = {
  cleanDB: cleanCollections,
  seedDB: seedDB
};
