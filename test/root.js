process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const Root = require('../models/root')
const wordData = require('./mocks/word')
const rootData = require('./mocks/root')

const { cleanDB, seedDB } = require('../scripts/seedDB');

chai.use(chaiHttp)

describe('Roots', () => {
  describe('/GET roots', () => {
    before(async () => await seedDB())

    it('it should GET all the roots', (done) => {
      chai.request(server)
        .get('/api/v2/roots')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(rootData.mocks.length)
          done()
        })
    });
  })
})
