const query = require("./query");
const sql = require("./sql");
const questionMocks = require("../../test/mocks/loggedQuestion").mocks;
const sessionMocks = require("../../test/mocks/session").mocks;

const seed = async () => {
  await clean();
  await query(...sql.saveSession(sessionMocks[0]));
  await query(...sql.saveSession(sessionMocks[1]));
  await query(...sql.saveSession(sessionMocks[2]));
  await query(...sql.saveQuestion(questionMocks[0]));
  await query(...sql.saveQuestion(questionMocks[1]));
  await query(...sql.saveQuestion(questionMocks[2]));
  return;
};

const clean = async () => {
  await teardown();
  await query(sql.createSessionsTable);
  await query(sql.createQuestionsTable);
  return;
};

const teardown = async () => {
  await query("DROP TABLE IF EXISTS sessions;");
  await query("DROP TABLE IF EXISTS questions;");
  return;
};

module.exports = {
  seed: seed,
  clean: clean,
  teardown: teardown
};
