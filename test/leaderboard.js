process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

const { seedDB } = require("../scripts/seedDB");

const userMock = require("./mocks/user").mock;
const userData = require("./mocks/user");
const schoolMock = require("./mocks/school").mock;
const classMock = require("./mocks/class").mock;

const leaderboard = require("../scripts/leaderboard");

chai.use(chaiHttp);

describe("Leaderboards", () => {
  before(async () => {
    await seedDB();
    await leaderboard.cache();
  });

  describe("/GET leaderboard", () => {
    it.only("it should GET all the ranks", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.weekly.should.be.a("array");
          res.body.allTime.should.be.a("array");
          done();
        });
    });

    it.only("it should GET all the ranks for a class", done => {
      chai
        .request(server)
        .get(`/api/v2/auth/leaderboard?classId=${classMock._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.weekly.should.be.a("array");
          res.body.allTime.should.be.a("array");
          done();
        });
    });    

    it("it should filter by school", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?school=" + schoolMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          _.unique(_.pluck(res.body, "schoolId")).should.be.eql([
            schoolMock._id
          ]);
          res.body.should.be.a("array");
          done();
        });
    });

    it("it should filter by period", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?period=" + "weekly")
        .end((err, res) => {
          res.should.have.status(200);
          _.unique(_.pluck(res.body, "period")).should.be.eql(["weekly"]);
          res.body.should.be.a("array");
          done();
        });
    });

    it("it should filter by student", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?user=" + userMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.eql(8);
          done();
        });
    });

    it("it should filter by student", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?user=" + userData.mocks[1]._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.eql(8);
          done();
        });
    });

    it("it should filter by teacher", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?teacher=" + userData.teacherMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.eql(8);
          done();
        });
    });

    it("it should filter by start", done => {
      chai
        .request(server)
        .get("/api/v2/auth/leaderboard?start=2")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.eql(6);
          done();
        });
    });
  });
});
