const mongoose = require("mongoose");

const echoSchema = new mongoose.Schema({ data: Object }, { timestamps: true });

module.exports = mongoose.model("Echo", echoSchema);
