const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema({
  title: String,
  image: String, // later we’ll store image path
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});

module.exports = mongoose.model("pin", pinSchema);
