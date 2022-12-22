var players = [];
const User = require("../models/User");

module.exports = function(socket) {
  console.log("Connected to Lobby!");
  socket.on("new_player", function(username) {
    socket.emit("curr_players", players);
    players.push({ socket: socket.id, username: username });
    console.log(players )
    socket.broadcast.emit("add_new_player", username);
  });
  socket.on("disconnect", function() {
    console.log("Connection disconnecteddddd");
    var index = getIndex(socket.id);
    players.splice(index, 1);
    socket.broadcast.emit("player_quit", index);
  });
socket.on("send_msg", function(data){
  socket.broadcast.emit("opp_msg",data)
})
  socket.on("challenge", function(data) {
    socket.broadcast
      .to(players[data.opp_index].socket)
      .emit("opp_challenge", {
        username: players[data.index].username,
        index: data.index
      });
  });

  socket.on("game_room", function() {
    var index = players.indexOf(socket);
    players.splice(index, 1);
    socket.broadcast.emit("player_quit", index + 1);
  });

  socket.on("accept", function(data) {
    var opp = players[data.opp_index];
    var player = players[data.index];
    User.findOneAndUpdate(
      { username: opp.username },
      { $set: { gameRoom: data.gameId } },
      { upsert: false },
      function(err, doc) {
        if (err) {
          throw err;
        } else {
          console.log("Updated");
        }
      }
    );
    User.findOneAndUpdate(
      { username: player.username },
      { $set: { gameRoom: data.gameId } },
      { upsert: false },
      function(err, doc) {
        if (err) {
          throw err;
        } else {
          console.log("Updated");
        }
        socket.emit("change_room");
        socket.broadcast.to(opp.socket).emit("opp_accept");
      }
    );

  });

  socket.on("setGameRoom", function(data) {
    console.log(data);
    User.findOneAndUpdate(
      { username: data.user },
      { $set: { gameRoom: data.gameID } },
      { upsert: false },
      function(err, doc) {
        if (err) {
          throw err;
        } else {
          console.log("Updated");
        }
      }
    );
  });
};

function getIndex(val) {
  for (var i = 0; i < players.length; i++)
    if (players[i].socket == val) return i;
  return -1;
}
