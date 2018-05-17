const url = require('url');

const MESSAGE_TYPES = {
  ONLINE_CLIENTS: "ONLINE_CLIENTS",
  CHALLENGE_REQUEST: "CHALLENGE_REQUEST"
}

module.exports.listen = server => {
  const io = require('socket.io')(server);
  const clients = {};

  function handleConnection(client, query) {
    clients[query.userId] = client.id;
    console.log(`${query.userId}:${client.id} connected`)
    console.log(`clients count ${Object.keys(clients).length}`)
    io.emit("message", { type: MESSAGE_TYPES.ONLINE_CLIENTS, data: Object.keys(clients) });    
  } 

  function handleChallenge(challenge) {
    const opponentSocketId = clients[challenge.opponentId];
    this.client.to(opponentSocketId).emit("message", { type: MESSAGE_TYPES.CHALLENGE_REQUEST, data: challenge });
  }

  function handleAcceptChallenge(challenge) {
    Object.values(challenge).forEach(userId => {
      const socketId = clients[userId];
      const socket = io.sockets.connected[socketId];
      if (socket) { console.log("socket exists! for " + userId); }
    })
  }  

  io.sockets.on("connection", client => {
    const query = url.parse(client.handshake.url, true).query;
    this.client = client;

    handleConnection(client, query);

    client.on("challenge", handleChallenge.bind(this));
    client.on("acceptChallenge", handleAcceptChallenge.bind(this));
    /*const {
      gameId,
      username,
      userId,
      userElo
    } = url.parse(client.handshake.url, true).query;

    if (userId) {
      const client = {};
      clients[userId] = "active";
      console.log(clients);
      io.emit("message", clients);
    }

    /*client.on("disconnect", () => {
      if (userId) { delete clients[userId]; }
      io.emit("clients", clients);
    });

    if (gameId) {
      console.log("joining room: " + gameId);
      client.join(gameId);    
    }

    if (username) {
      io.to(gameId).emit("joined", { opponentUsername: username, opponentId: userId, opponentElo: userElo });
    }

    client.on("challenge", msg => {
      const {
        opponentId,
        userId
      } = msg;
      console.log(msg)
    })  

    client.on("score", msg => {
      const {
        progress,
        room,
        userId
      } = msg;

      io.to(room).emit("score", { userId: userId, progress: progress });
    })*/
  })
}
