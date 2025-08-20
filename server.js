const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");

const Room = require('./models/Room')
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/room");
const messageRoutes = require("./routes/message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.use(express.static("public"));

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/chatapp").then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);


// in your chat app:

// Use socket.to(roomId).emit("chatMessage", data) → when a user sends a chat message. send to others, not new user
// Use io.to(roomId).emit("joinRoom", data) → when a user joins the room (so even the sender sees the message).
// Use io.emit("serverAnnouncement", data) → for global notices to all users.

// Socket.IO
io.on("connection", (socket) => {
  console.log("⚡ User connected", socket.id);

  socket.on("joinRoom", async (roomId, username) => {
    socket.join(roomId);

    data = { user: username, message: `${username} has joined ` }
    socket.to(roomId).emit("joinRoom", data); // send to others, not new user


  });
  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data); // broadcast to all users
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3000, () => console.log("🚀 Server running on port 3000"));
