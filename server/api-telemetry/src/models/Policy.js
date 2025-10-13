const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: false,
    // unique:true,
    lowercase: true,
  },
  jsonObj: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores the order for each JSON array key
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PolicySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Policy", PolicySchema);
