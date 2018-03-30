const express = require("express");

const ClassController = require("./controllers/class");
const LeaderboardController = require("./controllers/leaderboard");
const LoginController = require("./controllers/login");
const SessionsController = require("./controllers/session");
const SchoolController = require("./controllers/school");
const LoggedQuestionsController = require("./controllers/loggedQuestion");
const UserController = require("./controllers/user");

const MailController = require("./controllers/mail");
const LevelController = require("./controllers/level");
const FactoidController = require("./controllers/factoid");
const WordController = require("./controllers/word");
const RootController = require("./controllers/root");
const QuestionController = require("./controllers/question");
const TextController = require("./controllers/text");

module.exports = app => {
  const apiRoutes = express.Router();

  //
  // CLASS
  //
  apiRoutes.post("/v2/auth/class", ClassController.create);
  apiRoutes.post("/v2/class/:id", ClassController.join);
  apiRoutes.get("/v2/auth/class", ClassController.read);
  apiRoutes.get("/v2/auth/class/:id", ClassController.read);
  apiRoutes.get("/v2/auth/class/:id/students", ClassController.readStudents);
  apiRoutes.patch("/v2/admin/class/:id", ClassController.update);
  apiRoutes.delete("/v2/admin/class/:id", ClassController.delete);

  //
  // FACTOID
  //
  apiRoutes.post("/v2/admin/factoids", FactoidController.create);
  apiRoutes.get("/v2/factoids", FactoidController.read);
  apiRoutes.patch("/v2/admin/factoids/:id", FactoidController.update);
  apiRoutes.delete("/v2/admin/factoids/:id", FactoidController.delete);

  //
  // JOBS
  //
  apiRoutes.post(
    "/v2/auth/clearSessions",
    require("./scripts/clearSessions").run
  );

  //
  // LEADERBOARDS
  //
  apiRoutes.get("/v2/auth/leaderboard", LeaderboardController.read);

  //
  // LEVEL
  //
  apiRoutes.post("/v2/level", LevelController.create);
  apiRoutes.get("/v2/level", LevelController.read);
  apiRoutes.get("/v2/level/:id", LevelController.read);
  apiRoutes.patch("/v2/level/:id", LevelController.update);
  apiRoutes.delete("/v2/level/:id", LevelController.delete);

  //
  // LOGGED QUESTION
  //
  apiRoutes.get("/v2/auth/question", LoggedQuestionsController.read);
  apiRoutes.get("/v2/auth/question/:userId", LoggedQuestionsController.read);
  apiRoutes.post("/v2/auth/question", LoggedQuestionsController.create);

  //
  // LOGIN
  //
  apiRoutes.post("/v2/login", LoginController.loginRequest);

  //
  // QUESTION
  //
  apiRoutes.get("/v2/question", QuestionController.read);
  apiRoutes.post("/v2/question", QuestionController.create);

  //
  // MAIL
  //
  apiRoutes.post("/v2/auth/mail", MailController.post);

  //
  // ROOT
  //
  apiRoutes.get("/v2/roots", RootController.read);
  apiRoutes.get("/v2/roots/:value", RootController.readOne);

  //
  // SCHOOL
  //
  apiRoutes.post("/v2/admin/school", SchoolController.create);
  apiRoutes.get("/v2/admin/school", SchoolController.read);
  apiRoutes.get("/v2/auth/school/:id", SchoolController.read);
  apiRoutes.patch("/v2/admin/school/:id", SchoolController.update);
  apiRoutes.delete("/v2/admin/school/:id", SchoolController.delete);

  //
  // SESSION
  //
  apiRoutes.get("/v2/auth/session", SessionsController.read);
  apiRoutes.get("/v2/auth/session/:userId", SessionsController.read);

  //
  // TEXT
  //
  apiRoutes.post("/v2/texts/parse", TextController.parse);

  //
  // USER V1
  //
  apiRoutes.post("/user/create", UserController.create); // Used by Apiary
  apiRoutes.get("/user", UserController.read); // Used by Apiary
  apiRoutes.get("/user/:id", UserController.read); // Used by Apiary
  apiRoutes.post("/user/login", UserController.login); // Used by Apiary
  apiRoutes.patch("/user", UserController.update); // Used by Apiary

  //
  // USER V2
  //
  apiRoutes.post("/v2/user", UserController.create);
  apiRoutes.get("/v2/auth/user", UserController.read);
  apiRoutes.get("/v2/auth/user/:id", UserController.read);
  apiRoutes.patch("/v2/admin/user/joinSchool", UserController.joinSchool);
  apiRoutes.patch("/v2/auth/user/stats", UserController.update);
  apiRoutes.patch(
    "/v2/auth/user/:id/completedLevel",
    UserController.completedLevel
  );
  apiRoutes.patch(
    "/v2/admin/user/resetStarCounts",
    UserController.resetStarCounts
  );
  apiRoutes.patch("/v2/auth/user/:id", UserController.update2);
  apiRoutes.patch("/v2/auth/user/joinClass", UserController.joinClass);
  apiRoutes.delete("/v2/admin/user/:id", UserController.delete);

  // WORD
  apiRoutes.post("/v2/admin/words", WordController.create);
  apiRoutes.get("/v2/words", WordController.read);
  apiRoutes.get("/v2/words/:id", WordController.read);
  apiRoutes.get("/v2/related-words", WordController.relatedWords);
  apiRoutes.patch("/v2/admin/words/:id", WordController.update);
  apiRoutes.delete("/v2/admin/words/:id", WordController.delete);

  app.use("/api", apiRoutes);
};
