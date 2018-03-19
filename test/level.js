process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const Level = require('../models/level')
const levelMock = require('./mocks/level').mock

const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

describe('Levels', () => {
  describe('/GET levels', () => {
    before(async () => await seedDB())

    it('it should GET all the levels', (done) => {
      chai.request(server)
        .get('/api/v2/level')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(3)
          done()
        })
    });
  })

  describe('/GET/:id level', () => {
    before(async () => await seedDB())

    it('it should GET a level by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/level/' + levelMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('words')
            res.body.should.have.property('progressBars')
            res.body.should.have.property('slug')
            res.body.should.have.property('ratios')
            res.body.should.have.property('name')
            res.body.should.have.property('type')
            res.body.should.have.property('_id').eql(levelMock._id)
          done()
      })
    })
  });  

  describe('/POST level', () => {
    before(async () => await cleanDB())

    it('it should POST a valid level', (done) => {
      chai.request(server)
        .post('/api/v2/level')
        .send(levelMock)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          done()
        })
    });
  });

  describe('/PATCH/:id level', () => {
    before(async () => await seedDB())

    it('it should UPDATE a level given the id', (done) => {
      chai.request(server)
        .patch('/api/v2/level/' + levelMock._id)
        .send(_.extend(levelMock, { progressBars: 5 }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
          done()
        })
    })
  });

  describe('/DELETE/:id level', () => {
    it('it should DELETE a level given the id', (done) => {
      chai.request(server)
        .delete('/api/v2/level/' + levelMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
          done()
        })
      })
  });
})
