var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');

var app = express();

// ---------------- VIEW ENGINE ----------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ---------------- SESSION ----------------
app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: 'hey hey'
}));

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());

// get already-registered mongoose model
const User = mongoose.model('user');

// local strategy (manual, Node 24 safe)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false);

      const isValid = await user.validatePassword(password);
      if (!isValid) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// serialize / deserialize
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ---------------- MIDDLEWARE ----------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


// ---------------- ROUTES ----------------
app.use('/', indexRouter);
app.use('/users', usersRouter);

// ---------------- 404 ----------------
app.use(function(req, res, next) {
  next(createError(404));
});

// ---------------- ERROR HANDLER ----------------
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.get("/uploads", (req, res) => {
  res.status(204).end();
});


module.exports = app;
