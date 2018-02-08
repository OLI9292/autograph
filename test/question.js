process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const _ = require('underscore')

const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const server = require('../server')
const chaiHttp = require('chai-http')

const Word = require('../models/word') 
const Root = require('../models/root') 
const Question = require('../models/question') 
const levelMock = require('./mocks/level').mock
const demoLevelMock = _.find(require('./mocks/level').mocks, m => m.isDemo)
const wordMocks = require('./mocks/word').mocks
const userMock = require('./mocks/user').mock

const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

let roots,
    word,
    words

describe('Question', () => {
  before(async () => {
    await seedDB()
    word = await Word.findOne({ value: 'carnivore' })
    words = await Word.find()
    roots = await Root.find()
  })

  describe('question defToOneRoot', () => {
    it('it should return a definition to root button question with 1 answer', function () {
      const level = 1;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('answer')
          .of.length(word.components.length)
          .and.satisfy(a => _.filter(a, x => x.missing).length === 1),
        expect(promise).to.eventually.have.property('choices').of.length(6)
          .and.satisfy(c => _.contains(_.pluck(c, 'value'), 'carn') || _.contains(_.pluck(c, 'value'), 'vor'))
          .and.satisfy(c => _.contains(_.pluck(c, 'hint'), 'meat') || _.contains(_.pluck(c, 'hint'), 'eat'))
      ])
    })
  })

  describe('question defToAllRoots', () => {
    it('it should return a definition to root button question with as many answers as roots', function () {
      const level = 2;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('answer')
          .of.length(word.components.length)
          .and.satisfy(a => _.filter(a, x => x.missing).length === _.filter(word.components, c => c.componentType === 'root').length),
        expect(promise).to.eventually.have.property('choices').of.length(6)
          .and.satisfy(c => _.contains(_.pluck(c, 'value'), 'carn') && _.contains(_.pluck(c, 'value'), 'vor'))
          .and.satisfy(c => _.contains(_.pluck(c, 'hint'), 'meat') && _.contains(_.pluck(c, 'hint'), 'eat'))
      ])
    })
  })  

  describe('question defCompletion', () => {
    it('it should return a definition completion question', function () {
      const level = 3;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('answer')
          .and.satisfy(a => a[0].value === 'meat' || a[0].value === 'eat'),
        expect(promise).to.eventually.have.property('choices').of.length(6)
      ])
    })
  }) 

  describe('question defToAllRootsNoHighlight', () => {
    it('it should return a definition to root button question with as many answers as roots and no highlight', function () {
      const level = 4;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('answer')
          .of.length(word.components.length)
          .and.satisfy(a => _.filter(a, x => x.missing).length === _.filter(word.components, c => c.componentType === 'root').length),
        expect(promise).to.eventually.have.property('choices').of.length(6)
          .and.satisfy(c => _.contains(_.pluck(c, 'value'), 'carn') && _.contains(_.pluck(c, 'value'), 'vor'))
          .and.satisfy(c => _.contains(_.pluck(c, 'hint'), 'meat') && _.contains(_.pluck(c, 'hint'), 'eat'))
      ])
    })
  })   

  describe('question wordToDef', () => {
    it('it should return a definition to a word question', function () {
      const level = 5;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('answer').deep.equal([{ value: 'carnivore', missing: true }]),
        expect(promise).to.eventually.have.property('choices').of.length(6)
      ])
    })
  })

  describe('question defToCharacters', () => {
    it('it should return a definition to character (for 1 root) button question', function () {
      const level = 6;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('prompt').eq('carnivore'),
        expect(promise).to.eventually.have.property('answer').to.satisfy(a => _.pluck(a, 'value').join('') === 'carnivore'),
        expect(promise).to.eventually.have.property('choices').of.length(12)
      ])
    })
  }) 

  describe('question wordToDef', () => {
    it('it should return a word to a definition question', function () {
      const level = 7;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('prompt').eq('carnivore'),
        expect(promise).to.eventually.have.property('answer').deep.equal([{ value: 'an animal that eats meat', missing: true }]),
        expect(promise).to.eventually.have.property('choices').of.length(6)
      ])
    })
  })  

  describe('question defToCharacters', () => {
    it('it should return a definition to character (for all roots) button question', function () {
      const level = 8;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('prompt').eq('carnivore'),
        expect(promise).to.eventually.have.property('answer').to.satisfy(a => _.pluck(a, 'value').join('') === 'carnivore'),
        expect(promise).to.eventually.have.property('choices').of.length(12)
      ])
    })
  })

  describe('question defToCharacters', () => {
    it('it should return a definition to character (for all roots) button question', function () {
      const level = 9;
      const promise = Promise.resolve(Question({ word: word, level: level }, words, roots));
      return Promise.all([
        expect(promise).to.eventually.have.property('prompt').eq('carnivore')
      ])
    })
  })  

  describe('/GET questions', () => {
    it('it should GET questions for the user and level', (done) => {
      chai.request(server)
        .get(`/api/v2/question?type=train&id=${levelMock._id}&user_id=${userMock._id}&stage=3`)
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    });
  })


  describe('/GET questions', () => {
    it('it should GET questions for a demo level', (done) => {
      chai.request(server)
        .get(`/api/v2/question?type=train&id=${demoLevelMock._id}&user_id=${userMock._id}&stage=2`)
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    });
  })  

  describe('/GET questions', () => {
    it('it should GET questions for a speed round (difficulty 3)', (done) => {
      const SPEED_ROUND = 3;
      const EXPECTED_COUNT = _.filter(wordMocks, m => m.obscurity === SPEED_ROUND).length;
      chai.request(server)
        .get(`/api/v2/question?type=speed&id=${SPEED_ROUND}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array').of.length(EXPECTED_COUNT)
          done()
        })
    });

    it('it should GET questions for a speed round (difficulty 5)', (done) => {
      const SPEED_ROUND = 5;
      const EXPECTED_COUNT = _.filter(wordMocks, m => m.obscurity === SPEED_ROUND).length;
      chai.request(server)
        .get(`/api/v2/question?type=speed&id=${SPEED_ROUND}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array').of.length(EXPECTED_COUNT)
          done()
        })
    });
  })
})
