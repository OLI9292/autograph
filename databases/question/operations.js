const query = require('./query');
const sql = require('./sql');
const questionMocks = require('../../test/mocks/question').mocks;

const seed = async () => {
  await clean()
  await query(...sql.saveQuestion(questionMocks[0]))
  await query(...sql.saveQuestion(questionMocks[1]))
  await query(...sql.saveQuestion(questionMocks[2]))
  return
}

const clean = async () => {
  await teardown()
  console.log(sql.createQuestionsTable)
  await query(sql.createQuestionsTable)
  return
}

const teardown = async () => {
  await query('DROP TABLE IF EXISTS questions;')
  return
}

module.exports = {
  seed: seed,
  clean: clean,
  teardown: teardown
}
