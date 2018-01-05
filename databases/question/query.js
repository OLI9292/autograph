const { Pool } = require('pg')

const CONFIG = require('../../config/main')

let pg

if (process.env.NODE_ENV === 'production') {
  pg = new Pool({
    host: CONFIG.QUESTION_DB_SERVER,
    port: CONFIG.QUESTION_DB_HOST,
    user: CONFIG.QUESTION_DB_USERNAME,
    password: CONFIG.QUESTION_DB_PASSWORD,
    database: CONFIG.QUESTION_DB_NAME
  })
} else {
  pg = new Pool({})
}
  
module.exports = (text, params) => pg.query(text, params)
