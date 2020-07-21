const express = require("express");
const http = require("http");
const app = new express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const crypto = require("crypto");

const { pairedUser } = require("./db");

const PORT = process.env.PORT || 3000;
const priorityQuque = [];
let userCount = 0;
let pairCount = 0;
const sockets = {};

app.use(express.static(path.resolve(__dirname, "../build")));

server.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});

io.sockets.on("connection", function (socket) {
  //new user login
  userCount++;
  io.sockets.emit("system", userCount);
  socket.on("login", function (nickname) {
    //socket.userIndex = users.length;
    crypto.randomBytes(12, (err, buf) => {
      if (err) throw err;
      const id = buf.toString("hex");
      socket.id = id;
      sockets[socket.id] = socket;
      socket.nickname = nickname;
      socket.isPaired = false;
      socket.pairCount = "";
      socket.otherUserId = "";
      priorityQuque.push(id);
      socket.emit("loginSuccess");
      findPairForUser();
    });
  });
  //user leaves
  socket.on("disconnect", function () {
    if ("id" in socket) {
      if (socket.isPaired) {
        pairedUser.del(socket.pairCount);
        const otherUserSocket = sockets[socket.otherUserId];
        otherUserSocket.emit("partnerLeft");
        delete sockets[socket.id];
        priorityQuque.push(otherUserSocket.id);
      } else {
        delete sockets[socket.id];
      }
    }

    userCount--;
    socket.broadcast.emit("system", userCount);
  });
  //new message get
  socket.on("postMsg", function (msg) {
    const otherUserSocket = sockets[socket.otherUserId];
    otherUserSocket.emit("newMsg", socket.nickname, msg);
  });
  function findPairForUser() {
    while (priorityQuque.length > 1) {
      if (pairedUser.set(pairCount, [priorityQuque[0], priorityQuque[1]], 0)) {
        const userSocket = sockets[priorityQuque[0]];
        const otherUserSocket = sockets[priorityQuque[1]];
        pairCount++;
        userSocket.isPaired = true;
        userSocket.pairCount = pairCount;
        userSocket.otherUserId = priorityQuque[1];
        otherUserSocket.isPaired = true;
        otherUserSocket.pairCount = pairCount;
        otherUserSocket.otherUserId = priorityQuque[0];
        priorityQuque.splice(0, 2);
        userSocket.emit(
          "gotAPair",
          userSocket.nickname,
          otherUserSocket.nickname
        );
        otherUserSocket.emit(
          "gotAPair",
          otherUserSocket.nickname,
          userSocket.nickname
        );
      }
    }
  }
});
