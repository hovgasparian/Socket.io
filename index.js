const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

require("dotenv").config();

let messageHistory = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (username) => {
    socket.username = username;
    socket.broadcast.emit("user joined", `${username} joined the chat`);
  });

  socket.on("chat message", (messageData) => {
    messageData.timestamp = new Date().toLocaleTimeString();
    messageHistory.push(messageData);
    io.emit("chat message", messageData);
  });

  socket.on("request messages", () => {
    socket.emit("stored messages", messageHistory);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");

    socket.broadcast.emit("user left", `${socket.username} left the chat`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`listening on PORT: ${process.env.PORT}`);
});
