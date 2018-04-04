process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();

chai.use(chaiHttp);

describe("Images", () => {
  describe("/GET image", () => {
    it("it should GET an image for a word", done => {
      const word = "carnivore";
      chai
        .request(server)
        .get(`/api/v2/auth/image?word=${word}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
