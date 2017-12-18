process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

const User = require('../models/user')

const userMock = require('./mocks/user')[0];

const loginCredentials = {
  email: 'oliver@gmail.com',
  password: 'password123'
}

describe('Login', () => {
  beforeEach((done) => {
    User.remove({}, (err) => { 
      done()         
    })     
  });

  describe('/POST login', () => {
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

    /*  TODO: - fix this test that is failing on GitHub, because process.env is not set

    it('it should login a user with valid credentials', (done) => {
      const user = new User(_.extend(userMock, loginCredentials))
      user.save((err, user) => {      
        chai.request(server)
          .post('/api/v2/login')
          .send(loginCredentials)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('token')
            res.body.should.have.property('user')
            res.body.should.have.property('expires')
            res.body.should.be.a('object')
            done()
          })
        })
    });
    
    */

    it('it should not login an invalid user', (done) => {
      const user = new User(Object.assign(userMock, { email: 'rick@gmail.com', password: loginCredentials.password }))
      user.save((err, user) => {      
        chai.request(server)
          .post('/api/v2/login')
          .send(loginCredentials)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('error')
            res.body.should.be.a('object')
            done()
          })
        })
    });      

    it('it should not login a user with a wrong password', (done) => {
      const user = new User(Object.assign(userMock, { email: loginCredentials.email, password: 'wrong'  }))
      user.save((err, user) => {      
        chai.request(server)
          .post('/api/v2/login')
          .send(loginCredentials)
          .end((err, res) => {
            res.should.have.status(422)
            res.body.should.have.property('error')
            res.body.should.be.a('object')
            done()
          })
        })
    }); 
  });
})
