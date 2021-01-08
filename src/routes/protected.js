const argv = require("yargs").help("info").argv;
const express = require("express");
const passport = require("passport");
const path = require("path");
const LocalStrategy = require("passport-local").Strategy;
const auth = require("../lib/auth");
const utils = require("../lib/utils");

const config = argv.config
  ? require(path.join(process.cwd(), `./${argv.config}`))
  : null;

// eslint-disable-next-line new-cap
const router = express.Router();

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    function (username, password, done) {
      auth.authenticate(username, password, done);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  utils.db.findUser({ id }, (err, user) => {
    done(err, user);
  });
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(config.auth.failureRedirectTo);
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(config.auth.successRedirectTo);
    });
  })(req, res, next);
});

router.post("/signup", (req, res) => {
  const password = req.body.password;
  const username = req.body.username;
  // const host = `${req.protocol}://${req.headers.host}`;

  // eslint-disable-next-line no-unused-vars
  auth.prepareForSignup(username, password, (err, msg, token) => {
    if (err) {
      res.redirect(config.auth.failureRedirectTo);
    } else {
      res.redirect(config.auth.successRedirectTo);
      /*
       * need to send the email
       * emailService.sendConfirmSignupLink(email, host, token, (err) => {
       *   if (err) {
       *     req.flash("error", strings.email.signup.error);
       *     res.redirect(`/${constants.VIEW.SIGNUP}`);
       *   }
       *   req.flash("info", strings.email.signup.success);
       *   res.redirect(`/${constants.VIEW.LOGIN}`);
       * });
       */
    }
  });
});

module.exports = router;
