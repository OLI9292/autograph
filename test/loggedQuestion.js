process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

const db = require("../databases/question/operations");
const server = require("../server");
const questionMock = require("./mocks/loggedQuestion").mock;
const questionMocks = require("./mocks/loggedQuestion").mocks;

chai.use(chaiHttp);

describe("Questions", () => {
  describe("/GET question", () => {
    before(async () => await db.seed());

    it("it should GET all the questions", done => {
      chai
        .request(server)
        .get("/api/v2/auth/question")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array").length(3);
          done();
        });
    });
  });

  describe("/GET question/:userId", () => {
    before(async () => await db.seed());

    it("it should GET all the questions for the user", done => {
      chai
        .request(server)
        .get(`/api/v2/auth/question/${questionMock.user_id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array").length(2);
          done();
        });
    });
  });

  describe("/POST question", () => {
    beforeEach(async () => await db.clean());

    it("it should POST a question", done => {
      chai
        .request(server)
        .post("/api/v2/auth/question")
        .send(questionMock)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });
});
