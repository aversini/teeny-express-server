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
  DEFAULT_KEY_LEN,
  DEFAULT_SALT_SIZE,
  DEFAULT_TOTAL_ITERATIONS,
  HTTP_BAD_REQUEST: 400,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_OK: 200,
  HTTP_SERVER_ERROR: 500,
  HTTP_UNAUTHORIZED: 401,
  ONE_MINUTE,
  ONE_YEAR,
  PORT: 3000,
  STRINGS: {
    ACCOUNT_IN_USE: "This account is already registered...",
    APP_TITLE: "Teeny Static Server",
    BAD_CREDENTIALS: "Invalid credentials...",
    INTERNAL_ERROR: "An internal error occurred, please try again.",
    NOT_ACTIVE_YET: "This account has not been activated yet...",
  },
  TEN_SECONDS,
  TWENTY_FOUR_HOURS,
  TWO_WEEKS,
  VERSION: pkg.version,
};
