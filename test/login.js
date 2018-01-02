process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

const User = require('../models/user')

const userMock = require('./mocks/user').mock;

const loginCredentials = {
  email: userMock.email,
  password: userMock.password
}

describe('Login', () => {
  beforeEach(async () => {
    await seedDB()
  })

  describe('/POST login', () => {
    it('it should login a user', (done) => {
      chai.request(server)
        .post('/api/v2/login')
        .send(loginCredentials)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          done()
        })
    });  

    ['email', 'password'].forEach(attr => {
      it(`it should not login a user missing ${attr}`, (done) => {
        chai.request(server)
          .post('/api/v2/login')
          .send(_.omit(loginCredentials, attr))
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('error')
            res.body.should.be.a('object')
            done()
          })
      })  
    });

    it('it should not login an invalid user', (done) => {
        chai.request(server)
          .post('/api/v2/login')
          .send(_.extend({}, loginCredentials, { email: 'nobody@gmail.com' }))
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('error')
            res.body.should.be.a('object')
            done()
        })
    });      

    it('it should not login a user with a wrong password', (done) => {
      chai.request(server)
        .post('/api/v2/login')
        .send(_.extend({}, loginCredentials, { password: 'wrong' }))
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.have.property('error')
          res.body.should.be.a('object')
          done()
        })
    }); 
  });
})
