const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get chat history
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate("userId", "username")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
