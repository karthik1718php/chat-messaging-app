const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/most-active-user', async (req, res) => {
  try {
    const activeusers = await Message.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users"
        }
      },
      { $unwind: "$users" },
      {
        $group: {
          _id: "$userId",
          username: { $first: "$users.username" },
          msgCount: { $sum: 1 }
        }
      },
      { $sort: { msgCount: -1 } },
      { $limit: 1 }
    ]);

    res.status(200).json({ data: activeusers })
  } catch (err) {
    res.status(500).json({ error: err.message });

  }
})

module.exports = router;
