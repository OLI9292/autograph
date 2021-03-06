process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();
const { xor } = require("lodash");

const Word = require("../models/word");
const wordMocks = require("./mocks/word").mocks;
const wordMock = require("./mocks/word").mock;
const rootMock = require("./mocks/root").mock;

const { cleanDB, seedDB } = require("../scripts/seedDB");

chai.use(chaiHttp);

describe("Words", () => {
  describe("user.sharesRootWith()", () => {
    before(async () => {
      await seedDB();
    });

    it("it should return words that share a root", async () => {
      const carnivore = await Word.findOne({ value: "carnivore" });
      const sharesRoot = carnivore.sharesRootWith();
      return expect(sharesRoot).to.eventually.satisfy(arr =>
        _.isEmpty(xor(_.pluck(arr, "value"), ["herbivore", "omnivore"]))
      );
    });
  });

  describe("/GET words", () => {
    beforeEach(async () => await seedDB());

    it("it should GET all the words", done => {
      chai
        .request(server)
        .get("/api/v2/words")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(wordMocks.length);
          done();
        });
    });

    it("it should GET all the words for a root", done => {
      chai
        .request(server)
        .get("/api/v2/words" + "?root=" + rootMock.value)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body[0].value.should.eql("carnivore");
          done();
        });
    });
  });

  describe("/GET/:id word", () => {
    before(async () => await seedDB());

    it("it should GET a word by the given id", done => {
      chai
        .request(server)
        .get("/api/v2/words/" + wordMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("value");
          res.body.should.have.property("obscurity");
          res.body.should.have.property("categories");
          res.body.should.have.property("components");
          res.body.should.have.property("definition");
          res.body.should.have.property("_id").eql(wordMock._id);
          done();
        });
    });
  });

  describe("/POST words", () => {
    beforeEach(async () => await cleanDB());

    it("it should POST a valid word", done => {
      chai
        .request(server)
        .post("/api/v2/admin/words")
        .send(wordMock)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          done();
        });
    });

    ["value", "components", "definition"].forEach(attr => {
      it(`it should not POST a word missing ${attr}`, done => {
        chai
          .request(server)
          .post("/api/v2/admin/words")
          .send(_.omit(wordMock, attr))
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.have.property("error");
            res.body.should.be.a("object");
            done();
          });
      });
    });
  });

  describe("/PATCH/:id word", () => {
    before(async () => await seedDB());

    it("it should UPDATE a word given the id", done => {
      chai
        .request(server)
        .patch("/api/v2/admin/words/" + wordMock._id)
        .send(_.extend(wordMock, { obscurity: 5, categories: ["science"] }))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("value").eql(wordMock.value);
          res.body.should.have.property("obscurity").eql(5);
          res.body.should.have.property("categories").eql(["science"]);
          done();
        });
    });
  });

  describe("/DELETE/:id word", () => {
    before(async () => await seedDB());

    it("it should DELETE a word given the id", done => {
      chai
        .request(server)
        .delete("/api/v2/admin/words/" + wordMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("value");
          done();
        });
    });
  });
});
