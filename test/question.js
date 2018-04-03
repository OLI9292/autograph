/*process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const _ = require("underscore");

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const server = require("../server");
const chaiHttp = require("chai-http");

const Word = require("../models/word");
const Root = require("../models/root");
const { getQuestions } = require("../models/question");
const levelData = require("./mocks/level");
const wordMocks = require("./mocks/word").mocks;
const questionMock = require("./mocks/question").mock;
const userMock = require("./mocks/user").mock;

const { cleanDB, seedDB } = require("../scripts/seedDB");

chai.use(chaiHttp);

let roots, word, cosmopolis, words;

describe("Question", () => {
  before(async () => {
    await seedDB();
    word = await Word.findOne({ value: "carnivore" });
    cosmopolis = await Word.findOne({ value: "cosmopolis" });
    words = await Word.find();
    roots = await Root.find();
  });

  describe("/POST questions", () => {
    beforeEach(async () => await cleanDB());

    it("it should POST a valid question", done => {
      chai
        .request(server)
        .post("/api/v2/question")
        .send({ level: "abcd-chinese", questions: [questionMock] })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });
  });

  describe("question defToOneRoot", () => {
    it("it should return a definition to root button question with 1 answer", function() {
      const level = 1;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .of.length(word.components.length)
          .and.satisfy(a => _.filter(a, x => x.missing).length === 1),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "value"), "carn") ||
              _.contains(_.pluck(c, "value"), "vor")
          )
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "hint"), "meat") ||
              _.contains(_.pluck(c, "hint"), "eat")
          )
      ]);
    });
  });

  describe("question defToAllRoots", () => {
    it("it should return a definition to root button question with as many answers as roots", function() {
      const level = 2;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .of.length(word.components.length)
          .and.satisfy(
            a =>
              _.filter(a, x => x.missing).length ===
              _.filter(word.components, c => c.componentType === "root").length
          ),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "value"), "carn") &&
              _.contains(_.pluck(c, "value"), "vor")
          )
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "hint"), "meat") &&
              _.contains(_.pluck(c, "hint"), "eat")
          )
      ]);
    });

    it("it should return a definition to root button question with as many answers as roots", function() {
      const level = 2;
      const promise = Promise.resolve(
        getQuestions({ word: cosmopolis, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .of.length(cosmopolis.components.length)
          .and.satisfy(
            a =>
              _.filter(a, x => x.missing).length ===
              _.filter(cosmopolis.components, c => c.componentType === "root")
                .length
          ),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
      ]);
    });
  });

  describe("question defCompletion", () => {
    it("it should return a definition completion question", function() {
      const level = 3;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .and.satisfy(a => a[0].value === "meat" || a[0].value === "eat"),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
      ]);
    });
  });

  describe("question defToAllRootsNoHighlight", () => {
    it("it should return a definition to root button question with as many answers as roots and no highlight", function() {
      const level = 4;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .of.length(word.components.length)
          .and.satisfy(
            a =>
              _.filter(a, x => x.missing).length ===
              _.filter(word.components, c => c.componentType === "root").length
          ),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "value"), "carn") &&
              _.contains(_.pluck(c, "value"), "vor")
          )
          .and.satisfy(
            c =>
              _.contains(_.pluck(c, "hint"), "meat") &&
              _.contains(_.pluck(c, "hint"), "eat")
          )
      ]);
    });
  });

  describe("question wordToDef", () => {
    it("it should return a definition to a word question", function() {
      const level = 5;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("answer")
          .deep.equal([{ value: "carnivore", missing: true }]),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(6)
      ]);
    });
  });

  describe("question defToCharacters", () => {
    it("it should return a definition to character (for 1 root) button question", function() {
      const level = 6;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("prompt")
          .eq("carnivore"),
        expect(promise)
          .to.eventually.have.property("answer")
          .to.satisfy(a => _.pluck(a, "value").join("") === "carnivore"),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(12)
      ]);
    });
  });

  describe("question wordToDef", () => {
    it("it should return a word to a definition question", function() {
      const level = 7;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("prompt")
          .to.satisfy(a =>
            _.isEqual(a.normal, [{ value: "Carnivore", highlight: false }])
          ),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(4)
      ]);
    });
  });

  describe("question defToCharacters", () => {
    it("it should return a definition to character (for all roots) button question", function() {
      const level = 8;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("prompt")
          .eq("carnivore"),
        expect(promise)
          .to.eventually.have.property("answer")
          .to.satisfy(a => _.pluck(a, "value").join("") === "carnivore"),
        expect(promise)
          .to.eventually.have.property("choices")
          .of.length(12)
      ]);
    });
  });

  describe("question defToCharacters", () => {
    it("it should return a definition to character (for all roots) button question", function() {
      const level = 9;
      const promise = Promise.resolve(
        getQuestions({ word: word, level: level }, words, roots)
      );
      return Promise.all([
        expect(promise)
          .to.eventually.have.property("prompt")
          .eq("carnivore")
      ]);
    });
  });

  describe("/GET questions", () => {
    beforeEach(async () => await seedDB());

    it("it should GET questions for a demo round", done => {
      chai
        .request(server)
        .get("/api/v2/question?type=demo")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });

    it("it should GET questions for the user and level", done => {
      chai
        .request(server)
        .get(
          `/api/v2/question?type=train&id=${levelMock._id}&user_id=${
            userMock._id
          }&stage=3`
        )
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it("it should GET questions for an explore level", done => {
      chai
        .request(server)
        .get(
          `/api/v2/question?type=explore&user_id=${userMock._id}&id=${
            levelData.exploreMock._id
          }`
        )
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be
            .a("array")
            .of.length(levelData.exploreMock.words.length);
          done();
        });
    });

    it("it should GET questions at the same level for an explore level", done => {
      chai
        .request(server)
        .get(
          `/api/v2/question?type=explore&user_id=${userMock._id}&id=${
            levelData.exploreMock._id
          }&questionLevel=4`
        )
        .end((err, res) => {
          res.should.have.status(200);
          _.uniq(_.pluck(res.body, "type"))
            .should.be.a("array")
            .of.length(1);
          done();
        });
    });

    it("it should GET questions for a speed round", done => {
      chai
        .request(server)
        .get(
          `/api/v2/question?type=speed&user_id=${userMock._id}&id=${
            levelData.speedMock._id
          }`
        )
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });

    it("it should GET questions for a multiplayer round", done => {
      const seed = "terrace,carnivore,herbivore";
      chai
        .request(server)
        .get(
          `/api/v2/question?type=multiplayer&user_id=${
            userMock._id
          }&seed=${seed}`
        )
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
  });
});
*/