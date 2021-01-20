# Teeny Static Server
[![npm version](https://badge.fury.io/js/teeny-static-server.svg)](https://badge.fury.io/js/teeny-static-server)

> Teeny Static Server is a simple configurable static server, powered by Express.

It provides some default out of the box:

- Authentication via [Passport](http://passportjs.org/)
  - Registration
  - Registration verification
  - Session expiration
  - Login
  - Logout
  - Password recovery
- Database persistence
  - MongoDB and [Mongoose](https://mongoosejs.com)
  - JSON file based via [Lowdb](https://github.com/typicode/lowdb)
- Routes configuration
  - Static caching
  - GZIP compression
  - Automatic HTTPS redirection
  - Custom favicon
  - Authentication
  - Token verification (useful for registration)
  - Access to internal database API (proxied to either MongoDB or Lowdb)
    - findUser()
    - updateUser()
    - addUser()

## Installation

```sh
> cd your-project
> npm install --save teeny-static-server
```

## Starting

Assuming you created a configuration file under `your-project/config.js`, you can start your new server with the following command line:

```sh
> cd your-project
> npx teeny-static-server --config config.js
```

## Configuration

The configuration file is a JavaScript module.

```js
// my-project/config.js
const path = require("path");

module.exports = {
  /**
   * Port the server will listen to.
   */
  port: 3000,
  /**
   * Database configuration.
   */
  database: (DB_TYPE) => ({
    /**
     * The type of database to use for this project.
     * One of DB_TYPE.MONGODB or DB_TYPE.LOWDB.
     */
    type: DB_TYPE.MONGODB,
    /**
     * The location of the DB.
     * For LowDB, it needs to be the full path to a JSON file.
     * For MongoDB, it is only used in dev mode, and needs to be a folder.
     * In production, MongoDB with rely on the environment variable
     * ATLAS_DB_URI.
     */
    location: path.join(process.cwd(), "tmp/DB"),
  }),
  /**
   * Authentication redirects.
   * This object list all potential redirects for the following actions:
   * login, register, activate, forgot and update.
   */
  auth: {
    login: {
      /**
       * Where to redirect when login is successful.
       */
      successRedirectTo: "/",
      /**
       * Where to redirect when access requires authentication
       * and the user is not authenticated.
       */
      notAuthenticatedRedirectTo: "/login",
      /**
       * Where to redirect when login is not successful.
       * This can be for multiple reasons: user does not exist or password
       * is invalid. The parameter used here (auth=401) is simply an
       * example, but anything can be used instead.
       */
      failureRedirectTo: "/login?auth=401",
    },
    register: {
      /**
       * Where to redirect when a user has successfully registered a
       * new account (but not yet activated).
       */
      successRedirectTo: "/login?auth=201",
      /**
       * Where to redirect when a user has failed to registered a
       * new account. The reason is unknown (internal serve error).
       */
      failureRedirectTo: "/login?auth=500",
      /**
       * Where to redirect when a user has failed to registered a
       * new account. The reason is because the account already exists.
       */
      alreadyExistsRedirectTo: "/login?auth=403",
      /**
       * How to confirm the registration.
       * 2 choices:
       * - none: once someone registers, it's done!
       * - json: this adds one step to the registration process: activation.
       * By choosing json, the response from the registration will be a JSON
       * object with one key: "url" with an activation URL.
       * It's up to the implementer to use that URL and provide it to the
       * person who is registering. One way is to send an email with it.
       * Once this URL is hit, the account is activated and the user can
       * login. As long as this URL is not used, the account remains dormant.
       */
      confirmation: "json",
    },
    activate: {
      /**
       * Where to redirect to when a user is hitting the "activate" URL provided
       * during registration if the confirmation choice was "json" (see above).
       */
      successRedirectTo: "/",
      /**
       * Where to redirect to when a user is hitting an "activate " URL that is
       * invalid (invalid token, or it's been used before).
       */
      failureRedirectTo: "/login?auth=406",
    },
    forgot: {
      /**
       * Where to redirect to when a user ask for their password to be reset, but
       * the request failed.
       */
      failureRedirectTo: "/login?auth=500",
    },
    update: {
      /**
       * What is the corresponding static route where password reset activation
       * requests should be routed to. Please see the special "token" key provided
       * in the static route.
       */
      updatePassword: "/update",
      /**
       * Where to redirect to when password reset has been successful.
       */
      successRedirectTo: "/login?auth=202",
      /**
       * Where to redirect to when password reset has not been successful.
       */
      failureRedirectTo: "/login?auth=500",
    },
  },
  /**
   * What favicon to use for this application.
   */
  favicon: path.join(process.cwd(), "public/favicon.ico"),
  /**
   * List of static path that needs special caching. For example,
   * JavaScript, CSS or images files. Each routes can use the "utils" helper
   * that provides a few constants, such as times in milliseconds that can
   * be used for caching expiration (but you can use your own if needed):
   *  - utils.TWENTY_FOUR_HOURS
   *  - utils.TWO_WEEKS
   *  - utils.ONE_YEAR
   */
  static: ({ utils }) => [
    {
      /**
       * Use this option to create a virtual path prefix (where the path does
       * not actually exist in the file system) for files that are served.
       */
      virtual: "",
      /**
       * This specifies the root directory from which to serve static assets.
       */
      root: path.join(process.cwd(), "public/js"),
      /**
       * Set the max-age property of the Cache-Control header in milliseconds or
       * a string in ms format (see https://www.npmjs.com/package/ms).
       */
      maxAge: utils.isProd() ? utils.ONE_YEAR : 0,
    },
  ],
  /**
   * List of middleware and HTTP method routes (such as get, put, post, and so on).
   * Based on the keys provided, Teeny Static Server will interpret them as either
   * pure redirect to a static file or pure API request. If the special key "token"
   * is used and a token is available in the server (for example during activation),
   * it will be passed as a parameter to the corresponding URL, as in url?token=xxx.
   */
  routes: ({ utils }) => [
    /**
     * Example for a login page.
     * - route is the path to listen to
     * - method is the HTTP method (get, put, post, etc.)
     * - auth is a boolean indicating this route should not be protected by authentication
     * - file is the actual file to render when the route is resolved
     * - root is root directory from which to serve the file.
     */
    {
      route: "/login",
      method: "GET",
      auth: false,
      file: "login.html",
      root: path.join(process.cwd(), "public"),
    },
    /**
     * Example for a main page.
     * - route is the path to listen to
     * - method is the HTTP method (get, put, post, etc.)
     * - auth is a boolean indicating this route should be protected by authentication
     * - file is the actual file to render when the route is resolved
     * - root is root directory from which to serve the file.
     */
    {
      route: "/",
      method: "GET",
      auth: true,
      file: "index.html",
      root: path.join(process.cwd(), "public"),
    },
    /**
     * Example for a reset password page.
     * - route is the path to listen to
     * - method is the HTTP method (get, put, post, etc.)
     * - auth is a boolean indicating this route should not be protected by authentication
     * - token is a boolean indicating that any activation token should be passed as a param
     * - file is the actual file to render when the route is resolved
     * - root is root directory from which to serve the file.
     */
    {
      route: "/update",
      method: "GET",
      auth: false,
      token: true,
      file: "update.html",
      root: path.join(process.cwd(), "public"),
    },
    /**
     * Example for an API.
     * - route is the REST path
     * - method is the HTTP method (post)
     * - auth is a boolean indicating this route should be protected by authentication
     * - action is accepting a method to run, receiving req, res and next
     */
    {
      route: "/api/users",
      method: "POST",
      auth: true,
      action: (req, res, next) => {
        utils.db.findUser({ username: "testing" }, (err, user) => {
          res.send(err ? { status: "error" } : user);
        });
      },
    },
    /**
     * The last route should often be a catch all (*) and renders a 404 page.
     */
    {
      route: "*",
      method: "all",
      auth: false,
      file: "404.html",
      status: utils.constants.HTTP_NOT_FOUND,
      root: path.join(process.cwd(), "public"),
    },
  ],
};
```

## Appendix

### Mongo Shell

#### List all users

```sh
> mongo mongodb://localhost/teeny-server-s
MongoDB shell version v4.2.1
connecting to: mongodb://localhost:27017/teeny-server-s

db.users.find()
```
