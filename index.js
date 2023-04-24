const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const uuid = require("uuid")
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(cors());
app.use(express.json())
io.on('connection', (socket) => {
  console.log('A client connected', socket.id);

  socket.on('message', (data) => {
    console.log(`Received message from client: ${data.name}`);
    io.emit('message', `Echo: ${data}`);
  });
  socket.on('create-room',()=>{
    io.emit('create-room', uuid.v4())
  })
  socket.on('join-room',(id)=>{
    socket.to(id).emit('joined-room',id);
  })
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 3000');
});
