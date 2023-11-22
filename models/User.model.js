const mongoose = require("mongoose");

const UserRevealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide full name"],
    },
    vote: {
      type: String,
      enum: ["Boy", "Girl"],
      required: [true, "Vote is Required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserReveal", UserRevealSchema);
