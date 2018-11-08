const url = require('url');
const { guid } = require("./lib/helpers");

const MESSAGE_TYPES = {
  ONLINE_CLIENTS: "ONLINE_CLIENTS",
  CHALLENGE_REQUEST: "CHALLENGE_REQUEST",
  START_GAME: "START_GAME"
}

module.exports.listen = server => {
  const io = require('socket.io')(server);
  const clients = {};

  function handleLobbyConnection(client, query) {
    clients[query.userId] = client.id;
    console.log(`${query.userId}:${client.id} connected`)
    io.emit("message", { type: MESSAGE_TYPES.ONLINE_CLIENTS, data: Object.keys(clients) });    
  } 

  function handleGameConnection(client, query) {
    const { room, userId } = query;
    client.join(room);
  }   

  function submitChallenge(challenge) {
    const opponentSocketId = clients[challenge.opponentId];
    const message = { type: MESSAGE_TYPES.CHALLENGE_REQUEST, data: challenge };
    io.to(opponentSocketId).emit("message", message);
  }

  function acceptChallenge(challenge) {
    const room = guid();
    const userIds = Object.values(challenge);

    userIds.forEach(userId => {
      const socketId = clients[userId];
      const socket = io.sockets.connected[socketId];
      socket.join(room);
    });
    
    const message = { type: MESSAGE_TYPES.START_GAME, data: { room: room } };
    io.to(room).emit("message", message);
  }  

  function updateScore(data) {
    const message = { type: MESSAGE_TYPES.SCORE_UPDATE, data: data };
    io.to(data.room).emit("message", message);
  }

  function initiateRandomGame(data) {
    const room = guid();
    const { user, opponentId } = data;
    const userIds = [user.id, opponentId];

    userIds.forEach(userId => {
      const socketId = clients[userId];
      const socket = io.sockets.connected[socketId];
      socket.join(room);
    }); 

    const message = { type: MESSAGE_TYPES.START_GAME, data: { room: room, opponent: user } };
    io.to(room).emit("message", message);    
  }

  io.sockets.on("connection", client => {
    const query = url.parse(client.handshake.url, true).query;
    this.client = client;

    query.room 
      ? handleGameConnection(client, query)
      : handleLobbyConnection(client, query);

    client.on("submitChallenge", submitChallenge.bind(this));
    client.on("acceptChallenge", acceptChallenge.bind(this));
    client.on("updateScore", updateScore.bind(this));
    client.on("initiateRandomGame", initiateRandomGame.bind(this));

    client.on('"disconnect"', () => console.log(`client ${client.id} disconnected`));
  });
}
