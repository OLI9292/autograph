process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

const LoggedQuestion2 = require("../models/loggedQuestion2");
const loggedQuestion2Mocks = require("./mocks/loggedQuestion2").mocks;

const { cleanDB, seedDB } = require("../scripts/seedDB");

chai.use(chaiHttp);

describe("LoggedQuestion2s", () => {
  describe("/GET loggedQuestion2s", () => {
    before(async () => await seedDB());

    it("it should GET all the loggedQuestion2s", done => {
      chai
        .request(server)
        .get("/api/v2/loggedQuestion2")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });

  describe("/POST loggedQuestion2", () => {
    before(async () => await cleanDB());

    it("it should POST multiple loggedQuestion2", done => {
      chai
        .request(server)
        .post("/api/v2/loggedQuestion2")
        .send(loggedQuestion2Mocks)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("array").of.length(2);
          res.body[0].should.have.property("_id")
          res.body[1].should.have.property("_id")
          done();
        });
    });
  });
})
