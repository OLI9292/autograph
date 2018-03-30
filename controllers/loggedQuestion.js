const _ = require("underscore");

const query = require("../databases/question/query");
const sql = require("../databases/question/sql");

//
// CREATE
//

exports.create = async (req, res, next) => {
  try {
    await query(...sql.saveQuestion(req.body));
    return res.status(201).send();
  } catch (error) {
    return res.status(422).send({ error: error.message });
  }
};

//
// READ
//

exports.read = async (req, res, next) => {
  try {
    const result = await query(...sql.getQuestions(req.params.userId));
    return res.status(200).send(result.rows);
  } catch (error) {
    return res.status(422).send({ error: error.message });
  }
};
