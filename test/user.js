process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const User = require('../models/user')

const userMocks = require('./mocks/user');
const userMock = userMocks[0];

chai.use(chaiHttp)

describe('Users', () => {
  beforeEach((done) => {
    User.remove({}, (err) => { 
      done()         
    })     
  })

  describe('/GET users', () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/v2/admin/user')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    });
  });

  describe('/GET/:id user', () => {
    it('it should GET a user by the given id', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        chai.request(server)
          .get('/api/v2/auth/user/' + user.id)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('firstName')
              res.body.should.have.property('lastName')
              res.body.should.have.property('signUpMethod')
              res.body.should.have.property('email')
              res.body.should.have.property('_id').eql(user.id)
            done()
        })
      })
    })     
  });  

  describe('/POST user', () => {
    it('it should POST a valid user', (done) => {
      chai.request(server)
        .post('/api/v2/user')
        .send(userMock)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.have.property('firstName').eql(userMock.firstName)
          res.body.should.have.property('lastName').eql(userMock.lastName)
          res.body.should.have.property('signUpMethod').eql(userMock.signUpMethod)
          res.body.should.have.property('email').eql(userMock.email)          
          res.body.should.be.a('object')
          done()
        })
    });

    ['firstName', 'lastName', 'signUpMethod'].forEach(attr => {
      it(`it should not POST a user missing ${attr}`, (done) => {
        chai.request(server)
          .post('/api/v2/user')
          .send(_.omit(userMock, attr))
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('error')
            res.body.should.be.a('object')
            done()
          })
      })      
    });

    it('it should POST multiple users', (done) => {
      chai.request(server)
        .post('/api/v2/user')
        .send(userMocks)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.a('array')
          res.body.filter((x) => x.error).should.have.lengthOf(1)
          res.body.filter((x) => !x.error).should.have.lengthOf(2)
          done()
        })
    });    
  });

  describe('/PATCH/:id user', () => {
    it('it should UPDATE a user given the id', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        chai.request(server)
          .patch('/api/v2/auth/user/' + user.id)
          .send(_.extend(user, { firstName: 'John', lastName: 'Dillinger' }))
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('firstName').eql('John')
              res.body.should.have.property('lastName').eql('Dillinger')
              res.body.should.have.property('signUpMethod').eql(user.signUpMethod)
              res.body.should.have.property('_id').eql(user.id)
            done()
          })
        })
    })
  });

  describe('/PATCH user/stats', () => {
    it('it should UPDATE stats for a user', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        
        const data = {
          id: user.id,
          platform: 'web',
          stats: [
            { word: 'hypnotism', correct: false, difficulty: 8, time: 3 },
            { word: 'carnivore', correct: true, difficulty: 2, time: 4 },
            { word: 'herbivore', correct: true, difficulty: 4, time: 2 }
          ]
        }        

        chai.request(server)
          .patch('/api/v2/auth/user/stats')
          .send(data)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.have.property('user')
              res.body.user.should.have.property('words')
              res.body.user.words.should.be.a('array').lengthOf(3)
              res.body.user.words[0].should.have.property('name').eql(data.stats[0].word)
              res.body.user.words[0].should.have.property('correct').eql(0)
              res.body.user.words[0].should.have.property('experience').eql(1)
              res.body.user.words[0].should.have.property('timeSpent').eql(3)
              res.body.user.words[1].should.have.property('name').eql(data.stats[1].word)
              res.body.user.words[1].should.have.property('correct').eql(1)
              res.body.should.be.a('object')
            done()
          })
        })
    })
  });  

  describe('/DELETE/:id word', () => {
    it('it should DELETE a word given the id', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        chai.request(server)
          .delete('/api/v2/admin/user/' + user.id)
          .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('firstName')
            done()
          })
        })
    })
  });
})
