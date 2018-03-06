const mongoose = require('mongoose')

const CONFIG = require('../../config/main')
const plugins = require('./plugins')

plugins.forEach(plugin => mongoose.plugin(plugin))

const uri = 'mongodb://heroku_zcgwk208:lsqsemsg7cbtljulvgua53dh6d@ds111235-a0.mlab.com:11235,ds111235-a1.mlab.com:11235/heroku_zcgwk208?replicaSet=rs-ds111235';
const db = mongoose.createConnection(uri, { promiseLibrary: global.Promise })
//const db = mongoose.createConnection(CONFIG.MONGODB_URI, { promiseLibrary: global.Promise })

module.exports = db
