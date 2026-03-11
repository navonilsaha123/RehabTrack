const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  startTime: Date,
  endTime: Date
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
