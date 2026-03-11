const mongoose = require("mongoose");

const keyframeSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  imageUrl: String,
  verified: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Keyframe", keyframeSchema);
