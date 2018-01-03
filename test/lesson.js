process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const { cleanDB, seedDB } = require('../scripts/seedDB');

const Lesson = require('../models/lesson')

const lessonMock = require('./mocks/lesson').mock;

chai.use(chaiHttp)

describe('Lessons', () => {
  describe('/GET lesson', () => {
    before(async () => {
      await seedDB()
    })

    it('it should GET all the lessons', (done) => {
      chai.request(server)
        .get('/api/v2/lesson')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          done()
        })
    });
  });

  describe('/GET/:id lesson', () => {
    before(async () => await seedDB())

    it('it should GET a lesson by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/lesson/' + lessonMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('name').eql(lessonMock.name)
            res.body.should.have.property('filenames').be.a('array').eql(lessonMock.filenames)
            res.body.should.be.a('object')
          done()
      })
    })             
  });  

  describe('/POST lesson', () => {
    beforeEach(async () => await cleanDB())

    it('it should POST a valid lesson', (done) => {
      chai.request(server)
        .post('/api/v2/admin/lesson')
        .send(lessonMock)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          done()
        })
    });

    it('it should not POST a class missing a name', (done) => {
      chai.request(server)
        .post('/api/v2/admin/lesson')
        .send(_.omit(lessonMock, 'name'))
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    }); 
  });

  describe('/PUT/:id lesson', () => {
    before(async () => await seedDB())

    it('it should UPDATE a lesson given the id', (done) => {
      chai.request(server)
        .patch('/api/v2/admin/lesson/' + lessonMock._id)
        .send(_.extend({}, lessonMock, { name: 'Chew on This!', filenames: ['chew_on_this.txt', 'chew_on_this_2.txt'] }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name').eql('Chew on This!')
            res.body.should.have.property('filenames').lengthOf(2)
            res.body.should.have.property('questions').lengthOf(2)
            res.body.should.have.property('_id').eql(lessonMock._id)
          done()
        })
    })
  });  

  describe('/DELETE/:id lesson', () => {
    before(async () => await seedDB())

    it('it should DELETE a lesson given the id', (done) => {
      chai.request(server)
        .delete('/api/v2/admin/lesson/' + lessonMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name')
          done()
        })
    })
  });
})
