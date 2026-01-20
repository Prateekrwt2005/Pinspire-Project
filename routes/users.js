const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Pin = require("../models/pin");

/* ---------------- DB ---------------- */
mongoose.connect("mongodb://127.0.0.1:27017/pin");

/* ---------------- USER SCHEMA ---------------- */
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  boards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pin"
    }
  ]
});

/* ---------------- AUTH MIDDLEWARE ---------------- */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

/* ---------------- PASSWORD METHODS ---------------- */
userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("user", userSchema);

/* ---------------- MULTER (UPLOAD) ---------------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* =================================================
   ROUTES
================================================= */

/* ---------- REGISTER ---------- */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const user = new User({ username, email });
  await user.setPassword(password);
  await user.save();

  passport.authenticate("local")(req, res, () => {
    res.redirect("/users/profile");
  });
});

/* ---------- LOGIN ---------- */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/users/profile",
    failureRedirect: "/"
  })
);

/* ---------- PROFILE ---------- */
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("boards");

    const createdPins = await Pin.find({
      user: req.user._id,
      image: { $exists: true, $ne: "" }
    });

    res.render("profile", {
      user,
      createdPins   // ✅ THIS WAS MISSING BEFORE
    });

  } catch (err) {
    console.error(err);
    res.redirect("/feed");
  }
});


/* ---------- UPLOAD PIN ---------- */
router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.redirect("/feed");

    await Pin.create({
      title: req.body.title,
      image: req.file.filename,
      user: req.user._id
    });

    res.redirect("/feed");
  }
);

/* ---------- SAVE PIN ---------- */
router.post("/save/:pinid", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.boards.includes(req.params.pinid)) {
    user.boards.push(req.params.pinid);
    await user.save();
  }

  res.redirect("back");
});

/* ---------- DELETE PIN (PROFILE) ---------- */
router.post("/delete/:pinid", isLoggedIn, async (req, res) => {
  const pinId = req.params.pinid;

  const pin = await Pin.findById(pinId);
  if (!pin) return res.redirect("/users/profile");

  // security: only owner can delete
  if (pin.user.toString() !== req.user._id.toString()) {
    return res.redirect("/users/profile");
  }

  // ✅ SAFE IMAGE DELETE (FIX)
  if (pin.image) {
    const imgPath = path.join(
      __dirname,
      "../public/uploads",
      pin.image
    );

    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }
  }

  // remove pin from user's boards
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { boards: pinId }
  });

  // delete pin from DB
  await Pin.findByIdAndDelete(pinId);

  res.redirect("/users/profile");
});

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return res.redirect("/users/profile");
    }
    res.redirect("/");
  });
});


module.exports = router;
