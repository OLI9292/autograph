const _ = require('underscore')

const query = require('../databases/question/query');
const sql = require('../databases/question/sql');

//
// READ
//

exports.read = async (req, res, next) => {
  try {
    const result = await query(...sql.getSessions(req.params.userId))
    return res.status(200).send(result.rows);
  } catch (error) {
    return res.status(422).send({ error: error.message });  
  }
}
