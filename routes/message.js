const express = require("express");
const router = express.Router();
const app = express();
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const Message = require("../models/Message");

router.get('/messagesperrooms', async (req, res) => {
  console.log('api running')
  try {
    const messagesperroom = await Message.aggregate([
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room"
        }
      },
      {
        $unwind: "$room"
      },
      {
        $group: {
          _id: "$roomId",
          username: { $first: "$room.name" },
          totalMsgs: { $sum: 1 }
        }
      },
    ])
    res.status(200).json({ data: messagesperroom })

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.get('/dailymessage', async (req, res) => {
  try {
    const dailyMessage = await Message.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } // only date part
          },
          date: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
          perDaily: { $sum: 1 }
        }
      }
    ])
    res.status(200).json({ data: dailyMessage })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get chat history
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room"
        }
      },
      { $unwind: "$room" },
      {
        $project: {
          userName: "$user.username",
          msg: "$text",
          roomName: "$room.name"
        }
      }

    ])
    res.status(200).json({ success: true, data: messages });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
