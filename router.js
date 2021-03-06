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
const ImageController = require("./controllers/image");
const QuestionController = require("./controllers/question");
const GameController = require("./controllers/game");
const TextController = require("./controllers/text");
const Question2Controller = require("./controllers/question2");
const ChoiceSetController = require("./controllers/choiceSet");
const ChoiceTreeController = require("./controllers/choiceTree");
const LoggedQuestion2Controller = require("./controllers/loggedQuestion2");

module.exports = app => {
  const apiRoutes = express.Router();

  //
  // IMAGE
  //
  apiRoutes.get("/v2/auth/image", ImageController.read);

  //
  // CLASS
  //
  apiRoutes.post("/v2/auth/class", ClassController.create); // TODO: > admin
  apiRoutes.post("/v2/class/:id", ClassController.join); // TODO: remove
  apiRoutes.get("/v2/auth/class", ClassController.read);
  apiRoutes.get("/v2/auth/class/:id", ClassController.read);
  apiRoutes.get("/v2/auth/class/:id/students", ClassController.readStudents);
  apiRoutes.patch("/v2/auth/class/:id", ClassController.update);
  apiRoutes.delete("/v2/admin/class/:id", ClassController.delete);

  //
  // GAME
  //
  apiRoutes.get("/v2/auth/game", GameController.read);

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
  apiRoutes.post("/v2/level", LevelController.create); // TODO: > admin
  apiRoutes.get("/v2/level", LevelController.read);
  apiRoutes.get("/v2/level/:id", LevelController.read);
  apiRoutes.patch("/v2/level/:id", LevelController.update); // TODO: > admin
  apiRoutes.delete("/v2/level/:id", LevelController.delete); // TODO: > admin

  //
  // QUESTION2
  //
  apiRoutes.post("/v2/question2", Question2Controller.create); // TODO: > admin
  apiRoutes.get("/v2/question2", Question2Controller.read);
  apiRoutes.get("/v2/question2/:id", Question2Controller.read);
  apiRoutes.patch("/v2/question2/:id", Question2Controller.update); // TODO: > admin
  apiRoutes.delete("/v2/question2/:id", Question2Controller.delete); // TODO: > admin

  //
  // LOGGEDQUESTION2
  //
  apiRoutes.post("/v2/loggedQuestion2", LoggedQuestion2Controller.create); // TODO: > admin
  apiRoutes.get("/v2/loggedQuestion2", LoggedQuestion2Controller.read);

  //
  // CHOICESET
  //
  apiRoutes.post("/v2/choiceSet", ChoiceSetController.create); // TODO: > admin
  apiRoutes.get("/v2/choiceSet", ChoiceSetController.read);
  apiRoutes.get("/v2/choiceSet/:id", ChoiceSetController.read);
  apiRoutes.patch("/v2/choiceSet/:id", ChoiceSetController.update); // TODO: > admin
  apiRoutes.delete("/v2/choiceSet/:id", ChoiceSetController.delete); // TODO: > admin

  //
  // CHOICETREE
  //
  apiRoutes.post("/v2/choiceTree", ChoiceTreeController.create); // TODO: > admin
  apiRoutes.get("/v2/choiceTree", ChoiceTreeController.read);
  apiRoutes.get("/v2/choiceTree/:id", ChoiceTreeController.read);
  apiRoutes.patch("/v2/choiceTree/:id", ChoiceTreeController.update); // TODO: > admin
  apiRoutes.delete("/v2/choiceTree/:id", ChoiceTreeController.delete); // TODO: > admin

  //
  // LOGGED QUESTION
  //
  apiRoutes.get("/v2/auth/question", LoggedQuestionsController.read);
  apiRoutes.get("/v2/auth/question/:userId", LoggedQuestionsController.read);
  apiRoutes.post("/v2/auth/question", LoggedQuestionsController.create); // TODO: > admin

  //
  // LOGIN
  //
  apiRoutes.post("/v2/login", LoginController.loginRequest);

  //
  // QUESTION
  //
  apiRoutes.get("/v2/question", QuestionController.read);
  apiRoutes.post("/v2/question", QuestionController.create); // TODO: > admin

  //
  // MAIL
  //
  apiRoutes.post("/v2/auth/mail", MailController.post); // TODO: > admin

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
  apiRoutes.post("/v2/texts/parse", TextController.parse); // TODO: > admin

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
  apiRoutes.post("/v2/user", UserController.create); // TODO: > admin
  apiRoutes.get("/v2/auth/user", UserController.read); // TODO: > admin
  apiRoutes.get("/v2/auth/user/:id", UserController.read);
  apiRoutes.patch("/v2/admin/user/joinSchool", UserController.joinSchool);
  apiRoutes.patch("/v2/auth/user/stats", UserController.update);
  apiRoutes.patch(
    "/v2/auth/user/:id/completedLevel",
    UserController.completedLevel
  );
  apiRoutes.patch("/v2/auth/user/:id/friends", UserController.addFriend);
  apiRoutes.delete("/v2/auth/user/:id/friends", UserController.removeFriend);
  apiRoutes.patch(
    "/v2/admin/user/resetStarCounts",
    UserController.resetStarCounts
  );
  apiRoutes.patch(
    "/v2/auth/user/completedQuestions",
    UserController.completedQuestions
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
