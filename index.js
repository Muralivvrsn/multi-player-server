const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const uuid = require("uuid");
const app = express();
const server = http.createServer(app);
let users = [];
const port = process.env.PORT || 4000
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use(cors());
app.use(express.json());
io.on("connection", (socket) => {
  socket.on("create-room", () => {
    const id = uuid.v4();
    socket.emit("room-id", {
      id,
    });
  });
  socket.on("room-full", () => {
    const empty = users.length;
    users = (empty>4?users.slice(-1):users);
    socket.emit("room-full", empty);
  });
  socket.on("full-room",(data)=>{
    io.to(data).emit("full-room",users.length);
  })
  socket.on("join-room", (data) => {
    socket.join(data.room);
    socket.handshake.query.room = data.room;
    const user = { id: socket.id, name: data.name };
    users.push(user);
    console.log(users);
    setTimeout(() => {
      io.to(data.room).emit("joined", { user, users });
    }, 100);
  });

  socket.on("message-room", (data) => {
    io.to(data).emit("room", true);
  });
  socket.on("send_message", (data) => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 100);
  const bgcolor = `hsl(${h}deg, ${s}%, ${l}%)`;
    io.to(data.room).emit("recieved_message", {
      name:data.name,
      color:bgcolor
    });
  });
  socket.on("disconnect", () => {
    const user = users.find((user) => user.id === socket.id);
    users = users.filter((item) => item.id !== socket.id);
    io.to(socket.handshake.query.room).emit("player-out", { user, users });
  });
});

server.listen(port, () => {
  console.log("Server listening on port 4000");
});
