const mongoose = require("mongoose");

const CONFIG = require("../../config/main");
const plugins = require("./plugins");

plugins.forEach(plugin => mongoose.plugin(plugin));

const db = mongoose.createConnection(CONFIG.MONGODB_URI, {
  promiseLibrary: global.Promise
});

module.exports = db;
