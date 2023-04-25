const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const uuid = require("uuid");
const app = express();
const server = http.createServer(app);
let users = [];
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use(cors());
app.use(express.json());
io.on("connection", (socket) => {
  // console.log("A client connected", socket.id);
  // console.log(users)

  // creating room id
  socket.on("create-room", () => {
    const id = uuid.v4();
    io.emit("room-id", {
      id,
    });
  });

  //checking if room is full or not
  socket.on("room-full", () => {
    const empty = users.length >= 4 ? false : true;
    socket.emit("room-full", empty);
  });

  // joining the room
  socket.on("join-room", (data) => {
    socket.join(data.room);
    socket.handshake.query.room = data.room;
    const user = { id: socket.id, name: data.name };
    users.push(user);
    io.to(data.room).emit("joined", { user, users });
  });


  socket.on("message-room",(data)=>{
    io.to(data).emit("room",users.length);
  })
  // sending message to the room
  socket.on("send_message", (data) => {
    io.to(data.room).emit("recieved_message", data);
  });
  //if user disconnected or not
  socket.on("disconnect", () => {
    const user = users.find((user) => user.id === socket.id);
    users = users.filter((item) => item.id !== socket.id);
    io.to(socket.handshake.query.room).emit("player-out", { user, users });
  });
});

server.listen(4000, () => {
  console.log("Server listening on port 3000");
});
