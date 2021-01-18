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

const passportAuthentication = (req, res, next) => {
  passport.authenticate("local", function (err, user) {
    if (err || !user) {
      return res.redirect(config.auth.login.failureRedirectTo);
    }
    req.logIn(user, function (err) {
      return res.redirect(
        err
          ? config.auth.login.failureRedirectTo
          : config.auth.login.successRedirectTo
      );
    });
  })(req, res, next);
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    function (username, password, done) {
      auth.authenticate({ username, password }, done);
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
  passportAuthentication(req, res, next);
});

router.post("/register", (req, res, next) => {
  const password = req.body.password;
  const username = req.body.username;
  const host = `${req.protocol}://${req.headers.host}`;

  if (!password || !username || !host) {
    return res.redirect(config.auth.register.failureRedirectTo);
  }
  const active = config.auth.register.confirmation === "none";

  auth.prepareForRegistration(
    { username, password, active },
    (err, msg, token) => {
      if (err) {
        return res.redirect(config.auth.register.failureRedirectTo);
      }
      /**
       * Need to either reply with json or
       * simpy authenticate and login the new user directly!
       */
      switch (config.auth.register.confirmation) {
        case "none":
          return passportAuthentication(req, res, next);
        case "json":
          return res.send({ url: auth.getActivationURL({ host, token }) });

        default:
          res.redirect(config.auth.register.failureRedirectTo);
          break;
      }
    }
  );
});

router.post("/forgot", (req, res) => {
  const username = req.body.username;
  const host = `${req.protocol}://${req.headers.host}`;

  if (!username || !host) {
    return res.redirect(config.auth.register.failureRedirectTo);
  }

  auth.prepareForPasswordReset({ username }, (err, msg, token) => {
    if (err) {
      return res.redirect(config.auth.forgot.failureRedirectTo);
    }
    return res.send({ url: auth.getResetPasswordURL({ host, token }) });
  });
});

router.post("/update", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const token = req.body.token;

  auth.updatePasswordWithToken({ username, password, token }, (err) => {
    if (err) {
      res.redirect(config.auth.update.failureRedirectTo);
    } else {
      res.redirect(config.auth.update.successRedirectTo);
    }
  });
});

router.get("/activate/:action", (req, res) => {
  const action = req.params.action;
  const token = req.query.token;

  if (token && !(typeof token === "undefined") && token !== "") {
    if (action === "new") {
      auth.activate(token, (err) => {
        res.redirect(
          err
            ? config.auth.activate.failureRedirectTo
            : config.auth.activate.successRedirectTo
        );
      });
    } else {
      res.redirect(`${config.auth.update.updatePassword}?token=${token}`);
    }
  } else {
    res.redirect(config.auth.login.notAuthenticatedRedirectTo);
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(config.auth.login.successRedirectTo);
});

module.exports = router;
