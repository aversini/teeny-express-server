const argv = require("yargs").help("info").argv;
const express = require("express");
const path = require("path");
const utils = require("../lib/utils");

const config = argv.config
  ? require(path.join(process.cwd(), `./${argv.config}`))
  : null;

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Setup redirection logic if routes are
 * not authenticated.
 */
const ensureLogin = () =>
  require("connect-ensure-login").ensureLoggedIn({
    redirectTo: config.auth.notAuthenticatedRedirectTo,
  });

/**
 * Set up routes from configuration.
 */
config
  .routes({ utils })
  .forEach(({ auth, method, route, file, root, action, status, token }) => {
    const isProtected = auth
      ? ensureLogin()
      : (req, res, next) => {
          next();
        };

    if (file) {
      // this is a static route, just sending the file as is.
      router[method.toLowerCase()](route, isProtected, (req, res) => {
        if (!token) {
          res.status(status || utils.constants.HTTP_OK).sendFile(file, {
            root,
          });
        } else {
          const tokenQuery = req.query.token;
          if (
            tokenQuery &&
            typeof tokenQuery !== "undefined" &&
            tokenQuery !== ""
          ) {
            utils.db.findUser({ token: tokenQuery }, (err) => {
              if (err) {
                res.redirect(config.auth.login.failureRedirectTo);
              } else {
                res.status(status || utils.constants.HTTP_OK).sendFile(file, {
                  root,
                });
              }
            });
          } else {
            res.redirect(config.auth.login.failureRedirectTo);
          }
        }
      });
    } else if (action) {
      // this is an API route, using the provided callback action.
      router[method.toLowerCase()](route, isProtected, (req, res, next) => {
        action(req, res, next);
      });
    }
  });

module.exports = router;
