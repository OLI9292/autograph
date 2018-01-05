const mongoose = require('mongoose')
const CONFIG = require('../../config/main')

const db = mongoose.createConnection(CONFIG.MONGODB_URI, { useMongoClient: true, promiseLibrary: global.Promise })

module.exports = db
