process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const School = require('../models/school')
const User = require('../models/user')

const schoolMock = require('./mocks/school').mock;
const userMock = require('./mocks/user').mock;
const userMocks = require('./mocks/user').mocks;
const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

describe('Users', () => {

  describe('user.fullname()', () => {
    beforeEach(async () => await cleanDB())

    it('it should return the user\`s fullname', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        user.fullName().should.eql(userMock.firstName + ' ' + userMock.lastName)
        done()
      })
    });

    it('it should return the user\`s first name if they don\'t have a last name', (done) => {
      const user = new User(_.omit(userMock, 'lastName'))
      user.save((err, user) => {
        user.fullName().should.eql(userMock.firstName)
        done()
      })
    });    
  });  

  describe('user.initials()', () => {
    beforeEach(async () => await cleanDB())

    it('it should return the user\`s initials', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        user.initials().should.eql(userMock.firstName.charAt(0) + userMock.lastName.charAt(0))
        done()
      })
    });

    it('it should return the user\`s first initial if they don\'t have a last name', (done) => {
      const user = new User(_.omit(userMock, 'lastName'))
      user.save((err, user) => {
        user.initials().should.eql(userMock.firstName.charAt(0))
        done()
      })
    });    
  });

  describe('user.firstNameLastInitial()', () => {
    beforeEach(async () => await cleanDB())

    it('it should return the user\`s first name and last initial', (done) => {
      const user = new User(userMock)
      user.save((err, user) => {
        user.firstNameLastInitial().should.eql(userMock.firstName + ' ' + userMock.lastName.charAt(0))
        done()
      })
    });

    it('it should return the user\`s first name if they don\'t have a last name', (done) => {
      const user = new User(_.omit(userMock, 'lastName'))
      user.save((err, user) => {
        user.firstNameLastInitial().should.eql(userMock.firstName)
        done()
      })
    });    
  });    

  describe('/GET users', () => {
    before(async () => await seedDB())

    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/v2/auth/user')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(userMocks.length)
          done()
        })
    });
  });

  describe('/GET/:id user', () => {
    beforeEach(async () => await seedDB())

    it('it should GET a user by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/auth/user/' + userMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('firstName')
            res.body.should.have.property('lastName')
            res.body.should.have.property('signUpMethod')
            res.body.should.have.property('email')
            res.body.should.have.property('_id').eql(userMock._id)
          done()
      })
    })

    it('it should GET a user by their email', (done) => {
      chai.request(server)
        .get('/api/v2/auth/user?email=' + userMock.email)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('user')
            res.body.user.should.have.property('_id').eql(userMock._id)
          done()
      })
    })    
  });  

  describe('/POST user', () => {
    beforeEach(async () => await cleanDB())

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

    ['firstName', 'signUpMethod'].forEach(attr => {
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
          res.body.filter((x) => x.error).should.have.lengthOf(0)
          res.body.filter((x) => !x.error).should.have.lengthOf(userMocks.length)
          done()
        })
    });    
  });

  describe('/PATCH/:id user', () => {
    before(async () => await seedDB())

    it('it should UPDATE a user given the id', (done) => {
      chai.request(server)
        .patch('/api/v2/auth/user/' + userMock._id)
        .send(_.extend({}, userMock, { firstName: 'John', lastName: 'Dillinger' }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('firstName').eql('John')
            res.body.should.have.property('lastName').eql('Dillinger')
            res.body.should.have.property('_id').eql(userMock._id)
          done()
      })
    })
  });

  describe('/PATCH/joinSchool user', () => {
    before(async () => await seedDB())

    it('it should UPDATE school for multiple users', (done) => {
      chai.request(server)
        .patch('/api/v2/admin/user/joinSchool')
        .send({ school: schoolMock._id, users: _.pluck(userMocks, '_id') })
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('success')
            done()
        })
    })
  });  

  describe('/PATCH user/stats', () => {
    before(async () => await seedDB())

    it('it should UPDATE stats for a user', (done) => {        
      const data = {
        id: userMock._id,
        platform: 'web',
        stats: [
          { word: 'hypnotism', correct: false, difficulty: 5, time: 3 },
          { word: 'carnivore', correct: true, difficulty: 10, time: 4 },
          { word: 'herbivore', correct: true, difficulty: 4, time: 2 }
        ]
      }        

      chai.request(server)
        .patch('/api/v2/auth/user/stats')
        .send(data)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('words')
            res.body.should.have.property('weeklyStarCount').eql(userMock.weeklyStarCount + 2)
            res.body.words.should.be.a('array')
            res.body.should.be.a('object')
          done()
        })
    })
  });  

  describe('/DELETE/:id user', () => {
    before(async () => await seedDB())

    it('it should DELETE a user given the id', (done) => {
      chai.request(server)
        .delete('/api/v2/admin/user/' + userMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('firstName')
          done()
        })
    })
  });
})
