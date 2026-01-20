var express = require('express');
var router = express.Router();
const Pin = require("../models/pin");
const fs = require("fs");
const path = require("path");


router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  res.render("register");
});


router.get("/feed", async (req, res) => {
  const search = req.query.q;

  let query = {
    image: { $exists: true, $ne: "" }
  };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // 1️⃣ Fetch pins
  let pins = await Pin.find(query).populate("user");

  // 2️⃣ Delete broken ones
  for (const pin of pins) {
    const imgPath = path.join(
      __dirname,
      "../public/uploads",
      pin.image
    );

    if (!fs.existsSync(imgPath)) {
      await Pin.findByIdAndDelete(pin._id);
    }
  }

  // 3️⃣ Fetch AGAIN (clean data)
  const cleanPins = await Pin.find(query).populate("user");

  // 4️⃣ Render clean feed
  res.render("feed", {
    pins: cleanPins,
    user: req.user
  });
});


router.get("/upload", (req, res) => {
  res.render("upload");
});

module.exports = router;
