process.env.NODE_ENV = "test";

const _ = require("underscore");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const server = require("../server");
const should = chai.should();
const get = require("lodash/get");

const { cleanDB, seedDB } = require("../scripts/seedDB");

const Class = require("../models/class");
const User = require("../models/user");

const classMock = require("./mocks/class").mock;
const schoolMock = require("./mocks/school").mock;
const teacherMock = require("./mocks/user").teacherMock;

chai.use(chaiHttp);

describe("Classes", () => {
  describe("/GET class", () => {
    beforeEach(async () => await seedDB());

    it("it should GET all the classes", done => {
      chai
        .request(server)
        .get("/api/v2/auth/class")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe("/GET/:id class", () => {
    beforeEach(async () => await seedDB());

    it("it should GET a class by the given id", done => {
      chai
        .request(server)
        .get("/api/v2/auth/class/" + classMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("name").eql(classMock.name);
          res.body.should.have.property("_id").eql(classMock._id);
          done();
        });
    });

    it("it should GET a class by the given teacher id", done => {
      chai
        .request(server)
        .get("/api/v2/auth/class?teacher=" + classMock.teacher)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array").lengthOf(1);
          res.body[0].should.have.property("_id").eql(classMock._id);
          done();
        });
    });
  });

  describe("/POST class", () => {
    beforeEach(async () => await seedDB());
    const data = [
      { firstName: "tammy", lastName: "lee" },
      { firstName: "rocky", lastName: "bro" },
      {
        firstName: "john",
        lastName: "bee",
        email: "john@gmail.com",
        password: "super-dumb-pw",
        isTeacher: true
      }
    ];

    it("it should POST a valid class", done => {
      chai
        .request(server)
        .post("/api/v2/auth/class")
        .send(data)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("class").be.a("object");
          res.body.should.have.property("teacher").be.a("object");
          res.body.should.have
            .property("students")
            .be.a("array")
            .of.length(2);
          _.pluck(res.body.students, "firstName").should.deep.eq([
            "tammy",
            "rocky"
          ]);
          res.body.teacher.firstName.should.eq("john");
          res.body.class.students.should.deep.eq(
            _.pluck(res.body.students, "_id")
          );
          res.body.class.teacher.should.eq(res.body.teacher._id);
          const classes = _.flatten(
            _.pluck(res.body.students.concat(res.body.teacher), "classes")
          );
          _.pluck(classes, "role").should.deep.eq([
            "student",
            "student",
            "teacher"
          ]);
          _.uniq(_.pluck(classes, "id")).should.deep.eq([res.body.class._id]);
          done();
        });
    });

    it("it should POST a valid class and LOGIN when login=true", done => {
      chai
        .request(server)
        .post("/api/v2/auth/class?login=true")
        .send(data)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be
            .a("object")
            .have.all.keys(
              "user",
              "expires",
              "isTeacher",
              "sessionId",
              "token"
            );
          done();
        });
    });
  });

  describe("/PATCH/:id class", () => {
    beforeEach(async () => await seedDB());

    it("it should UPDATE a class given the id", done => {
      const updated = _.extend(classMock, { name: "Lower Lab" });
      chai
        .request(server)
        .patch("/api/v2/auth/class/" + classMock._id)
        .send(_.extend(classMock, { name: "Lower Lab" }))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("name").eql("Lower Lab");
          res.body.should.have.property("_id").eql(classMock._id);
          done();
        });
    });

    it("it should add students to a class given the id", done => {
      const students = [{ firstName: "ben", lastName: "burn" }, { firstName: "akiva", lastName: "sauce" }];
      const data = { 
        email: "oliver@playwordcraft.com",
        students: students
      };
      chai
        .request(server)
        .patch("/api/v2/auth/class/" + classMock._id)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("class");
          res.body.class.should.have.property("students");
          res.body.class.students.length.should.eql(classMock.students.length + students.length);
          res.body.should.have.property("newStudents");
          _.forEach(res.body.newStudents, student => get(student.classes[0], "id").should.eql(classMock._id));
          done();
        });
    });    
  });

  describe("/DELETE/:id class", () => {
    beforeEach(async () => await seedDB());

    it("it should DELETE a class and its users given the id", done => {
      chai
        .request(server)
        .delete("/api/v2/admin/class/" + classMock._id)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("name");
          done();
        });
    });
  });
});
