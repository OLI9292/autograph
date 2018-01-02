process.env.NODE_ENV = 'test'

const _ = require('underscore')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const server = require('../server')
const should = chai.should()

const { cleanDB, seedDB } = require('../scripts/seedDB');

const Class = require('../models/class')
const User = require('../models/user')

const classMock = require('./mocks/class').mock;
const schoolMock = require('./mocks/school').mock;
const teacherMock = require('./mocks/user').teacherMock;

chai.use(chaiHttp)

describe('Classes', () => {
  describe('/GET class', () => {
    beforeEach(async () => {
      await seedDB()
    })

    it('it should GET all the classes', (done) => {
      chai.request(server)
        .get('/api/v2/auth/class')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(1)
          done()
        })
    });
  });

  describe('/GET/:id class', () => {
    beforeEach(async () => {
      await seedDB()
    })

    it('it should GET a class by the given id', (done) => {
      chai.request(server)
        .get('/api/v2/auth/class/' + classMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name').eql(classMock.name)
            res.body.should.have.property('_id').eql(classMock._id)
          done()
      })
    }) 

    it('it should GET a class by the given teacher id', (done) => {
      chai.request(server)
        .get('/api/v2/auth/class?teacher=' + classMock.teacher)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array').lengthOf(1)
            res.body[0].should.have.property('_id').eql(classMock._id)
          done()
      })
    })             
  });  

  describe('/POST class', () => {
    beforeEach(async () => {
      await cleanDB()
    })

    it('it should POST a valid class', (done) => {
      const teacher = new User(teacherMock)
      const updatedClassMock = _.extend(classMock, { teacher: teacherMock._id });

      teacher.save((err, teacher) => {
        chai.request(server)
          .post('/api/v2/admin/class')
          .send(updatedClassMock)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.have.property('teacher').eql(updatedClassMock.teacher)
            res.body.should.have.property('name').eql(updatedClassMock.name)
            res.body.should.be.a('object')
            done()
          })
      })
    }); 

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

  describe('/PATCH/:id class', () => {
    beforeEach(async () => {
      await seedDB()
    })

    it('it should UPDATE a class given the id', (done) => {
      const updated = _.extend(classMock, { name: 'Lower Lab' })
      chai.request(server)
        .patch('/api/v2/admin/class/' + classMock._id)
        .send(_.extend(classMock, { name: 'Lower Lab' }))
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name').eql('Lower Lab')
            res.body.should.have.property('_id').eql(classMock._id)
          done()
        })
    })
  }); 

  describe('/DELETE/:id word', () => {
    beforeEach(async () => {
      await seedDB()
    })

    it('it should DELETE a word given the id', (done) => {
      chai.request(server)
        .delete('/api/v2/admin/class/' + classMock._id)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('name')
          done()
        })
    })
  });
})
