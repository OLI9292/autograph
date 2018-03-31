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
    const data = {
      email: "oliver@playwordcraft.com",
      password: "super-dope-password",
      name: "oliver",
      type: "welcome",
      students: [
        { firstName: "Ben", lastName: "Burn", email: "benb1", password: "bubbles6" },
        { firstName: "Akiva", lastName: "Sauce", email: "akivas1", password: "badboy52" }
      ]
    };

    it("it should send a welcome email", done => {
      chai
        .request(server)
        .post("/api/v2/auth/mail")
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be
            .a("object")
            .have.all.keys("to", "from", "subject", "templateId", "attachments");
          done();
        });
    }).timeout(100000);
  });
});
