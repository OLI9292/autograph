process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const Word = require('../models/word')
const WordList = require('../models/word')
const wordMock = require('./mocks/word').mock
const wordListMock = require('./mocks/wordList').mock

const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

describe('WordLists', () => {
  describe('/GET word-lists', () => {
    before(async () => await seedDB())
    
    it('it should GET all the word lists', (done) => {
      chai.request(server)
        .get('/api/v2/word-lists')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          done()
        })
    });
  })

  describe('/GET/:id word-lists', () => {
    before(async () => await seedDB())

    it('it should GET a word list by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/word-lists/' + wordListMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('name').eql(wordListMock.name)
            res.body.should.have.property('category').eql(wordListMock.category)
            res.body.should.have.property('updatedOn').eql(wordListMock.updatedOn)
            res.body.should.have.property('isStudy').eql(wordListMock.isStudy)
            res.body.should.have.property('_id').eql(wordListMock._id)
            res.body.should.be.a('object')
          done()
      })
    })
  });  

  describe('/POST word-lists', () => {
    beforeEach(async () => await cleanDB())

    it('it should not POST a word list with no matching words', (done) => {
      chai.request(server)
        .post('/api/v2/admin/word-lists')
        .send(wordListMock)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    });   

    it('it should POST a valid word list', (done) => {
      const word = new Word(wordMock)
      word.save((err, word) => {
        chai.request(server)
          .post('/api/v2/admin/word-lists')
          .send(wordListMock)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('object')
            done()
          })
      })
    });

    ['name', 'updatedOn'].forEach(attr => {
      it(`it should not POST a word list missing ${attr}`, (done) => {
        chai.request(server)
          .post('/api/v2/admin/word-lists')
          .send(_.omit(wordListMock, attr))
          .end((err, res) => {
              res.should.have.status(422)
              res.body.should.be.a('object')
            done()
          })
        })
    }) 
  });

  describe('/PUT/:id word-lists', () => {
    before(async () => await seedDB())

    it('it should UPDATE a word list given the id', (done) => {
      chai.request(server)
        .patch('/api/v2/admin/word-lists/' + wordListMock._id)
        .send(_.extend(wordListMock, { name: 'Advanced 2' }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
          done()
        })
      })
  });
})
