const argv = require("yargs").help("info").argv;
const compression = require("compression");
const express = require("express");
const favicon = require("serve-favicon");
const flash = require("connect-flash");
const helmet = require("helmet");
const logger = require("morgan");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const constants = require("./constants");
const mongoose = require("mongoose");
const utils = require("../lib/utils");
const MemoryStore = require("memorystore")(session);

const app = express();
const config = argv.config
  ? require(path.join(process.cwd(), `./${argv.config}`))
  : null;

/**
 *
 * SECURITY CONFIGURATION
 *
 * - Removing X-Powered-By header to make it slightly harder for
 *   attackers to see what potentially-vulnerable technology
 *   powers our site.
 * - Adding HSTS header that notifies user agents to only connect
 *   over HTTPS, even if the scheme chosen was HTTP. It does not
 *   take care of the redirection.
 * - Setting header X-Content-Type-Options to nosniff to tell
 *   the browser not to load scripts and stylesheets unless
 *   the server indicates the correct MIME type.
 * - Setting X-Frame-Options to DENY to prevent clickjacking.
 * - To use a production build in a local environment (without
 *   SSL/https), you local URL must start with "localhost".
 *   See utils.isLocal().
 *
 */
if (utils.isProd()) {
  app.use(helmet.hidePoweredBy());
  app.use(
    helmet.hsts({
      maxAge: utils.ONE_YEAR,
    })
  );
  app.use(helmet.noSniff());
  app.use(helmet.frameguard({ action: "deny" }));
}

/**
 *
 * ENCRYPTION CONFIGURATION (SSL)
 *
 * Redirect any non-https requests to https.
 *
 */
if (utils.isProd()) {
  app.all("/*", function (req, res, next) {
    if (utils.isLocal(req)) {
      return next();
    }
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(["https://", req.get("Host"), req.url].join(""));
    }
    return next();
  });
}

/**
 *
 * GZIP COMPRESSION, CACHE CONFIGURATION
 *
 */
if (utils.isProd()) {
  app.use(compression());
}

/**
 *
 * SESSIONS CONFIGURATION
 *
 */
app.use(
  session({
    cookie: {
      maxAge: utils.isProd() ? utils.TWO_WEEKS : utils.ONE_YEAR,
    },
    name: "TEENY-EXPRESS-SERVER",
    resave: false,
    saveUninitialized: false,
    secret: "ceci est un secret bien garde",
    store: new MemoryStore({
      // prune expired entries every 24h
      checkPeriod: utils.TWENTY_FOUR_HOURS,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/**
 *
 * HTTP LOGGER CONFIGURATION
 *
 */
app.use(logger(utils.isProd() ? "tiny" : "dev"));

/**
 *
 * BODY PARSER CONFIGURATION
 *
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * STATIC ROUTES CONFIGURATION
 * If cache is provided (via maxAge) it will be taken into account.
 */
config.static({ utils }).forEach(({ root, maxAge, virtual }) => {
  app.use(
    virtual,
    express.static(root, {
      maxAge: maxAge || 0,
    })
  );
});
app.use(favicon(config.favicon));

/**
 *
 * DATABASE CONFIGURATION
 *
 */
const mongoUri =
  process.env.ATLAS_DB_URI || "mongodb://localhost/teeny-server-s";
if (config.database(utils.DB_TYPE).type === utils.DB_TYPE.MONGODB) {
  mongoose.connect(mongoUri, {
    autoIndex: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

/**
 *
 * ROUTES CONFIGURATION
 * These include static endpoints, as well as API.
 *
 */
app.use("/", require("../routes/protected"));
app.use("/", require("../routes/custom"));

/**
 *
 * ERROR HANDLERS (404, 500, etc)
 *
 */
app.use((req, res) => {
  res.status(constants.HTTP_NOT_FOUND).render(`${constants.HTTP_NOT_FOUND}`);
});

if (!utils.isProd()) {
  // development error handler will print stacktrace
  app.use((err, req, res) => {
    res.status(err.status || constants.HTTP_SERVER_ERROR);
    res.render("error", {
      error: err,
      message: err.message,
    });
  });
}
// production error handler no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || constants.HTTP_SERVER_ERROR);
  res.render("error", {
    error: {},
    message: err.message,
  });
});

/**
 * Normalize port and store it in Express.
 */
const port = utils.normalizePort(config.port || constants.PORT);
app.set("port", port);

/**
 *
 * Application Entry Point
 *
 */
module.exports = app;
