process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const { cleanDB, seedDB } = require('../scripts/seedDB');

const School = require('../models/school')

const schoolMock = require('./mocks/school').mock;

chai.use(chaiHttp)

describe('Schools', () => {

  describe('/GET school', () => {
    before(async () => await seedDB())

    it('it should GET all the schools', (done) => {
      chai.request(server)
        .get('/api/v2/admin/school')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          done()
        })
    });
  });

  describe('/GET/:id school', () => {
    before(async () => await seedDB())

    it('it should GET a school by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/admin/school/' + schoolMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('name').eql(schoolMock.name)
            res.body.should.be.a('object')
          done()
      })
    })             
  });  

  describe('/POST school', () => {
    beforeEach(async () => await cleanDB())

    it('it should POST a valid school', (done) => {
      chai.request(server)
        .post('/api/v2/admin/school')
        .send(schoolMock)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          done()
        })
    });

    it('it should not POST a school missing a name', (done) => {
      chai.request(server)
        .post('/api/v2/admin/lesson')
        .send(_.omit(schoolMock, 'name'))
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    }); 
  });   

  describe('/PATCH/:id school', () => {
    before(async () => await seedDB())

    it('it should UPDATE a school given the id', (done) => {
      chai.request(server)
        .patch('/api/v2/admin/school/' + schoolMock._id)
        .send(_.extend(schoolMock, { country: 'Algeria' }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name').eql(schoolMock.name)
            res.body.should.have.property('country').eql('Algeria')
            res.body.should.have.property('_id').eql(schoolMock._id)
          done()
        })
    })
  });  

  describe('/DELETE/:id school', () => {
    before(async () => await seedDB())

    it('it should DELETE a school given the id', (done) => {
      chai.request(server)
        .delete('/api/v2/admin/school/' + schoolMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name')
          done()
        })
    })
  });
})
