const pkg = require("../../package.json");

const DEFAULT_SALT_SIZE = 48;
const DEFAULT_KEY_LEN = 128;
const DEFAULT_TOTAL_ITERATIONS = 10000;

/* eslint-disable no-magic-numbers */
const TEN_SECONDS = 10 * 1000;
const ONE_MINUTE = 6 * TEN_SECONDS;
const TWENTY_FOUR_HOURS = 24 * ONE_MINUTE;
const TWO_WEEKS = 14 * 24 * 60 * ONE_MINUTE;
const ONE_YEAR = 52 * 24 * 60 * ONE_MINUTE;
/* eslint-enable */

module.exports = {
  PORT: 3000,
  VERSION: pkg.version,

  HTTP_OK: 200,
  HTTP_BAD_REQUEST: 400,
  HTTP_NOT_FOUND: 404,
  HTTP_SERVER_ERROR: 500,

  STRINGS: {
    BAD_CREDENTIALS: "Invalid credentials...",
    EMAIL_IN_USE: "This email address is already registered...",
    INTERNAL_ERROR: "An internal error occurred, please try again.",
    NOT_ACTIVE_YET: "This account has not been activated yet...",
    APP_TITLE: "Teeny Static Server",
  },
  DEFAULT_SALT_SIZE,
  DEFAULT_KEY_LEN,
  DEFAULT_TOTAL_ITERATIONS,
  TEN_SECONDS,
  ONE_MINUTE,
  TWENTY_FOUR_HOURS,
  TWO_WEEKS,
  ONE_YEAR,
};
