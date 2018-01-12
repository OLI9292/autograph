process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const db = require('../databases/question/operations');
const server = require('../server')
const sessionMock = require('./mocks/session').mock;
const sessionMocks = require('./mocks/session').mocks;

chai.use(chaiHttp)

describe('Sessions', () => {
  
  describe('/GET session', () => {
    before(async () => await db.seed())

    it('it should GET all the sessions', (done) => {
      chai.request(server)
        .get('/api/v2/auth/session')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array').length(3)
          done()
        })
    });
  });

  describe('/GET session/:userId', () => {
    before(async () => await db.seed())
    
    it('it should GET all the sessions for the user', (done) => {
      chai.request(server)
        .get(`/api/v2/auth/session/${sessionMock.user_id}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array').length(2)
          done()
        })
    });    
  });
})
