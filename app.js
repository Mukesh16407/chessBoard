// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve your HTML, CSS, and JavaScript files here.
app.use(express.static(__dirname + "/public"));

// Socket.io logic for handling game state and events.
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendGameState", (data) => {
    socket.emit("receiveGameState", data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
