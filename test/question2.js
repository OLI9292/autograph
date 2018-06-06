process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

const Question2 = require("../models/question2");
const question2Mock = require("./mocks/question2").mock;

const { cleanDB, seedDB } = require("../scripts/seedDB");

chai.use(chaiHttp);

describe("Question2s", () => {
  describe("/GET question2s", () => {
    before(async () => await seedDB());

    it("it should GET all the question2s", done => {
      chai
        .request(server)
        .get("/api/v2/question2")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe("/GET/:id question2", () => {
    before(async () => await seedDB());

    it("it should GET a question2 by the given id", done => {
      chai
        .request(server)
        .get("/api/v2/question2/" + question2Mock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("identifier").eql(question2Mock.identifier);
          res.body.should.have.property("_id").eql(question2Mock._id);
          done();
        });
    });
  });

  describe("/POST question2", () => {
    before(async () => await cleanDB());

    it("it should POST a valid question2", done => {
      chai
        .request(server)
        .post("/api/v2/question2")
        .send(question2Mock)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });
  });

  describe("/PATCH/:id question2", () => {
    before(async () => await seedDB());

    it("it should UPDATE a question2 given the id", done => {
      chai
        .request(server)
        .patch("/api/v2/question2/" + question2Mock._id)
        .send(_.extend(question2Mock, { category: "Greek" }))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
  });

  describe("/DELETE/:id question2", () => {
    it("it should DELETE a question2 given the id", done => {
      chai
        .request(server)
        .delete("/api/v2/question2/" + question2Mock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
  });
});
