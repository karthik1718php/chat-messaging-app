const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");

const Room = require('./models/Room')
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/room");
const messageRoutes = require("./routes/message");

const Message = require("./models/Message");
const User = require("./models/User");


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


// in chat app:
// Use socket.to(roomId).emit("chatMessage", data) → when a user sends a chat message. send to others, not current user
// Use io.to(roomId).emit("joinRoom", data) → when a user joins the room (so even the sender sees the message).
// Use io.emit("serverAnnouncement", data) → for global notices to all users.
// Use io.to(userSocketId).emit("notification", data); -> Send notification to a specific user only

// Socket.IO
const userSockets = {}; // { userId: [socketId1, socketId2, ...] }

io.on("connection", (socket) => {
  console.log("⚡ User connected", socket.id);

  // When user logs in / connects, update status
  // When user logs in
  socket.on("joinApp", ({ userId }) => {
    socket.userId = userId;
    console.log("userId50::", userId);
    console.log("socket.id53::", socket.id);

    if (!userSockets[userId]) userSockets[userId] = [];
    userSockets[userId].push(socket.id);

    console.log("userSockets54::", userSockets);

    // Mark online
    User.findByIdAndUpdate(userId, { status: "online" }).then(() => {
      io.emit("userStatus", { userId, status: "online" });
    });
  });

  socket.on("joinRoom", async (roomId, username) => {
    socket.join(roomId);

    //Due to the lack of frontend support at that time, we temporarily used static user IDs.

    if (username == 'karthik') {
      userId = "68a30070981cdcca657c71f1"
    }

    if (username == 'arun') {
      userId = "68a30079981cdcca657c71f3"
    }

    const text = `${username} has joined `
    const message = new Message({ roomId, userId, text })
    await message.save()

    data = { user: username, message: text }
    socket.to(roomId).emit("joinRoom", data); // send to others, not new user

  });
  socket.on("chatMessage", async (data) => {

    username = data.user

    //Due to the lack of frontend support at that time, we temporarily used static user IDs.

    if (username == 'karthik') {
      userId = "68a30070981cdcca657c71f1"
    }

    if (username == 'arun') {
      userId = "68a30079981cdcca657c71f3"
    }

    const message = new Message({ roomId: data.roomName, userId, text: data.text })
    await message.save()
    io.emit("chatMessage", data); // broadcast to all users
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected", socket.id);
    const userId = socket.userId;

    if (!userId) return;

    // Remove this socketId from user
    userSockets[userId] = userSockets[userId].filter(id => id !== socket.id);
    console.log("userSockets116::", userSockets);

    // If no sockets left, mark offline
    if (userSockets[userId].length === 0) {
      await User.findByIdAndUpdate(userId, { status: "offline" });
      io.emit("userStatus", { userId, status: "offline" });
      delete userSockets[userId];
    }
  });
});

server.listen(3000, () => console.log("🚀 Server running on port 3000"));
