const mongoose = require("mongoose");

const CONFIG = require("../../config/main");
const plugins = require("./plugins");

plugins.forEach(plugin => mongoose.plugin(plugin));

const db = mongoose.createConnection(uri, {
  promiseLibrary: global.Promise
});

module.exports = db;
