process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

chai.use(chaiHttp);

describe("Mail", () => {
  describe("/POST mail", () => {
    it("it should send a welcome email", done => {
      chai
        .request(server)
        .post(
          "/api/v2/auth/mail?type=welcome&email=otplunkett@gmail.com&name=oliver"
        )
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be
            .a("object")
            .have.all.keys("to", "from", "subject", "text", "html");
          done();
        });
    });
  });
});
