const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    type: String,
    brand: String,
    dateReported: Date,
    serialNumber: {
      type: String,
      // unique: true,
    },
    assetTag: {
      type: String,
      // unique: true,
    },
    issue: String,
    status: String,
    dateCompleted: Date,
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", AssetSchema);
