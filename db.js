const mongoose = require('mongoose')

const CONFIG = require('./config/main')

mongoose.Promise = global.Promise
mongoose.connect(CONFIG.MONGODB_URI, { useMongoClient: true, promiseLibrary: global.Promise })

module.exports = mongoose
