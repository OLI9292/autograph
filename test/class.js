process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const Class = require('../models/class')
const User = require('../models/user')

const classMock = require('./mocks/class');
const userMock = require('./mocks/user')[0];

chai.use(chaiHttp)

describe('Classes', () => {
  beforeEach((done) => {
    Class.remove({}, (err) => { 
      done()         
    })     
  })

  describe('/GET class', () => {
    it('it should GET all the classes', (done) => {
      chai.request(server)
        .get('/api/v2/auth/class')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    });
  });

  describe('/GET/:id class', () => {
    it('it should GET a class by the given id', (done) => {
      const _class = new Class(classMock)
      _class.save((err, _class) => {
        chai.request(server)
          .get('/api/v2/auth/class/' + _class.id)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.students.should.have.lengthOf(2)
              res.body.should.have.property('name').eql(classMock.name)
              res.body.should.have.property('_id').eql(_class.id)
            done()
        })
      })
    }) 

    it('it should GET a class by the given teacher id', (done) => {
      const _class = new Class(classMock)
      _class.save((err, _class) => {
        chai.request(server)
          .get('/api/v2/auth/class?teacher=' + _class.teacher)
          .end((err, res) => {
            console.log(res.body)
              res.should.have.status(200)
              res.body.should.be.a('array').lengthOf(1)
              res.body[0].should.have.property('_id').eql(_class.id)
            done()
        })
      })
    })             
  });  

  describe('/POST class', () => {
    it('it should not POST a class without a valid teacher', (done) => {
      chai.request(server)
        .post('/api/v2/admin/class')
        .send(classMock)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    });

    it('it should POST a valid class', (done) => {
      const user = new User(userMock)
      const updatedClassMock = _.extend(classMock, { teacher: user.id });
      user.save((err, user) => {      
        chai.request(server)
          .post('/api/v2/admin/class')
          .send(updatedClassMock)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.have.property('teacher').eql(updatedClassMock.teacher)
            res.body.should.have.property('name').eql(updatedClassMock.name)
            res.body.should.have.property('students').lengthOf(updatedClassMock.students.length)
            res.body.should.be.a('object')
            done()
          })
      })
    });

    it('it should not POST a class missing a name', (done) => {
      chai.request(server)
        .post('/api/v2/admin/class')
        .send(_.omit(classMock, 'name'))
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    });      
  });


  describe('/DELETE/:id word', () => {
    it('it should DELETE a word given the id', (done) => {
      const _class = new Class(classMock)
      _class.save((err, _class) => {
        chai.request(server)
          .delete('/api/v2/admin/class/' + _class.id)
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
