# Teeny Static Server

> Teeny Static Server is a simple configurable static server, powered by Express.

It provides some default out of the box:

- Authentication via Passport
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
   * Port the server will listen to
   */
  port: 3000,
  /**
   * ProxyPass used in case you have configured this server to
   * be setup behind another one, such as Apache. The example below
   * assume the following configuration in Apache:
   *   ProxyPass /analytics http://localhost:3000
   *   ProxyPassReverse /analytics http://localhost:3000
   */
  proxyPass: "/analytics",
  /**
   * Database configuration.
   */
  database: (DB_TYPE) => ({
    /**
     * The type of database to use for this project.
     * One of DB_TYPE.MONGODB or DB_TYPE.LOWDB
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
    activate: {},
    forgot: {},
    update: {},
  },
  favicon: path.join(process.cwd(), "public/favicon.ico"),
  static: ({ utils }) => [],
  routes: ({ utils }) => [],
};
```

## Mongo Shell

### List all users

```sh
> mongo mongodb://localhost/teeny-server-s
MongoDB shell version v4.2.1
connecting to: mongodb://localhost:27017/teeny-server-s

db.users.find()
```
