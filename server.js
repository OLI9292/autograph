require("dotenv").config();
require("./databases/accounts/index");

const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");

const CONFIG = require("./config/main");
const router = require("./router");

mongoose.Promise = global.Promise;
mongoose.connect(CONFIG.MONGODB_URI, { promiseLibrary: global.Promise });

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(morgan("combined", { stream: OLOG.stream }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, access-token, key, session"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Don't validate requests during testing
if (process.env.NODE_ENV === "production") {
  app.all("/api/v2/*", [require("./middlewares/validateRequest")]);
}

app.listen(CONFIG.PORT, () =>
  console.log({
    level: "info",
    message: `App listening on port ${CONFIG.PORT}`
  })
);

router(app);

// For testing
module.exports = app;
