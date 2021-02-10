const crypto = require("crypto");
const constants = require("../config/constants");
const db = require("./db/proxy");

const isProd = () => process.env.NODE_ENV === "production";
const isLocal = (req) => req.header("host").startsWith("localhost");

/**
 * Normalize a given port into a number, string, or false.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

const generateSalt = (size = constants.DEFAULT_SALT_SIZE) => {
  let buf;
  try {
    buf = crypto.randomBytes(size);
  } catch (ex) {
    // nothing to declare officer
  }
  return buf.toString("hex");
};

const encryptString = (string, salt, done) => {
  const data = {};
  if (!salt) {
    data.salt = generateSalt();
  } else {
    data.salt = salt;
  }
  crypto.pbkdf2(
    string,
    data.salt,
    constants.DEFAULT_TOTAL_ITERATIONS,
    constants.DEFAULT_KEY_LEN,
    "sha512",
    (err, p) => {
      if (err) {
        throw err;
      }
      data.encryptedString = p.toString("hex");
      done(null, data);
    }
  );
};

const checkPassword = (opts, done) => {
  const password = opts.password || null;
  const encryptedPassword = opts.encryptedPassword || null;
  const salt = opts.salt || null;

  encryptString(password, salt, function (err, res) {
    if (err) {
      return done(err);
    } else if (encryptedPassword === res.encryptedString) {
      return done(null);
    } else {
      return done(1);
    }
  });
};

module.exports = {
  DB_TYPE: db.DB_TYPE,
  ONE_YEAR: constants.ONE_YEAR,
  TWENTY_FOUR_HOURS: constants.TWENTY_FOUR_HOURS,
  TWO_WEEKS: constants.TWO_WEEKS,
  checkPassword,
  constants,
  db,
  encryptString,
  generateSalt,
  isLocal,
  isProd,
  normalizePort,
};
