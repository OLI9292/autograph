process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

const Factoid = require("../models/factoid");
const factoidData = require("./mocks/factoid");

const { cleanDB, seedDB } = require("../scripts/seedDB");

chai.use(chaiHttp);

describe("Factoids", () => {
  describe("/GET factoids", () => {
    before(async () => await seedDB());

    it("it should GET all the factoids", done => {
      chai
        .request(server)
        .get("/api/v2/factoids")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(factoidData.mocks.length);
          done();
        });
    });

    it("it should GET all the factoids filtered by words", done => {
      const words = ["carnivore", "herbivore"];
      chai
        .request(server)
        .get(`/api/v2/factoids?words=${words.join(",")}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(words.length);
          _.forEach(words, word => _.flatten(_.pluck(res.body, "words")).should.include(word))
          done();
        });
    });    
  });
});
