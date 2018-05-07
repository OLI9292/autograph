require("newrelic");
require("dotenv").config();
require("./databases/accounts/index");

const app = require("express")();

const server = require("http").Server(app);
const io = require("socket.io")(server);
const url = require('url');

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");

const CONFIG = require("./config/main");
const router = require("./router");

mongoose.Promise = global.Promise;
mongoose.connect(CONFIG.MONGODB_URI, { promiseLibrary: global.Promise });

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

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

server.listen(CONFIG.PORT, () =>
  console.log({
    level: "info",
    message: `App listening on port ${CONFIG.PORT}`
  })
);

io.sockets.on("connection", socket => {
  const {
   player1,
   player2
  } = url.parse(socket.handshake.url, true).query;

  console.log("joining room: " + player1);
  socket.join(player1);

  if (player2) {
    io.to(player1).emit("joined", player2);
    io.to(player1).emit("start", Date.now());
  }

  socket.on("score", msg => {
    const {
      score,
      room,
      user
    } = msg;

    io.to(room).emit("score", { user: user, score: score });
  })
})

router(app);

// For testing
module.exports = app;
