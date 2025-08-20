const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// Create Room
router.post("/", async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    const room = new Room({ name, createdBy });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  const rooms = await Room.find().populate("createdBy", "username");
  res.json(rooms);
});

module.exports = router;
