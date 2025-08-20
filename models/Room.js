const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users:{String}
});

module.exports = mongoose.model("Room", RoomSchema);
