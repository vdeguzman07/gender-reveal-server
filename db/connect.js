const mongoose = require("mongoose");

exports.connectDB = (url) => {
  mongoose.set("strictQuery", false);
  return mongoose.connect(url);
};
