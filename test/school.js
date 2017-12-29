process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const School = require('../models/school')

const schoolMock = require('./mocks/school');

chai.use(chaiHttp)

describe('Schools', () => {
  beforeEach((done) => {
    School.remove({}, (err) => { 
      done()         
    })     
  })

  describe('/GET school', () => {
    it('it should GET all the schools', (done) => {
      chai.request(server)
        .get('/api/v2/admin/school')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    });
  });

  describe('/GET/:id school', () => {
    it('it should GET a school by the given id', (done) => {
      const school = new School(schoolMock)
      school.save((err, lesson) => {
        chai.request(server)
          .get('/api/v2/admin/school/' + school.id)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.have.property('name').eql(schoolMock.name)
              res.body.should.be.a('object')
            done()
        })
      })
    })             
  });  

  describe('/POST school', () => {
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

  // TODO: - add more test cases
  describe('/GET/:id/leaderboards school', () => {
    it('it should GET leaderboards for the given id', (done) => {
      const school = new School(schoolMock)
      school.save((err, school) => {
        chai.request(server)
          .get('/api/v2/auth/school/' + school.id + '/leaderboards')
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('earth').be.a('object')
              res.body.earth.should.have.property('allTime').eql([])
              res.body.earth.should.have.property('weekly').eql([])
              res.body.should.have.property(school.name).be.a('object')
              res.body[school.name].should.have.property('allTime').eql([])
              res.body[school.name].should.have.property('weekly').eql([])
            done()
        })
      })
    })           
  });   

  describe('/PATCH/:id school', () => {
    it('it should UPDATE a school given the id', (done) => {
      const school = new School(schoolMock)
      school.save((err, school) => {
        chai.request(server)
          .patch('/api/v2/admin/school/' + school.id)
          .send(_.extend(school, { country: 'Algeria' }))
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('name').eql(schoolMock.name)
              res.body.should.have.property('country').eql('Algeria')
              res.body.should.have.property('_id').eql(school.id)
            done()
          })
        })
    })
  });  

  describe('/DELETE/:id school', () => {
    it('it should DELETE a school given the id', (done) => {
      const school = new School(schoolMock)
      school.save((err, school) => {
        chai.request(server)
          .delete('/api/v2/admin/school/' + school.id)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('name')
            done()
          })
        })
    })
  });
})
