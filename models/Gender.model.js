const mongoose = require("mongoose");

const GenderSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      required: [true, "Please provide gender"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gender", GenderSchema);
