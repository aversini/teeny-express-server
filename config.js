const path = require("path");
module.exports = {
  port: 3000,
  proxyPass: "/analytics",
  database: (DB_TYPE) => ({
    //  type: DB_TYPE.LOWDB,

    // location: path.join(process.cwd(), "db.json"),
    type: DB_TYPE.MONGODB,
    location: path.join(process.cwd(), "tmp/DB"),
  }),
  auth: {
    login: {
      successRedirectTo: "/",
      notAuthenticatedRedirectTo: "/login",
      failureRedirectTo: "/login?auth=401",
    },
    register: {
      successRedirectTo: "/",
      failureRedirectTo: "/login?auth=500",
      alreadyExistsRedirectTo: "/login?auth=403",
      // valid options are "json" or "none"
      confirmation: "json",
    },
    activate: {
      successRedirectTo: "/",
      failureRedirectTo: "/login?auth=406",
    },
    forgot: {
      failureRedirectTo: "/login?auth=500",
    },
    update: {
      updatePassword: "/update",
      successRedirectTo: "/login?auth=202",
      failureRedirectTo: "/login?auth=500",
    },
  },
  favicon: path.join(process.cwd(), "public/favicon.ico"),
  static: ({ utils }) => [
    {
      virtual: "",
      root: path.join(process.cwd(), "public/js"),
      maxAge: utils.isProd() ? utils.ONE_YEAR : 0,
    },
    {
      virtual: "",
      root: path.join(process.cwd(), "public/css"),
      maxAge: utils.isProd() ? utils.ONE_YEAR : 0,
    },
  ],
  routes: ({ utils }) => [
    {
      route: "/",
      method: "GET",
      auth: true,
      file: "index.html",
      root: path.join(process.cwd(), "public"),
    },
    {
      route: "/login",
      method: "GET",
      auth: false,
      file: "login.html",
      root: path.join(process.cwd(), "public"),
    },
    {
      route: "/register",
      method: "GET",
      auth: false,
      file: "register.html",
      root: path.join(process.cwd(), "public"),
    },
    {
      route: "/forgot",
      method: "GET",
      auth: false,
      file: "forgot.html",
      root: path.join(process.cwd(), "public"),
    },
    {
      route: "/update",
      method: "GET",
      auth: false,
      token: true,
      file: "update.html",
      root: path.join(process.cwd(), "public"),
    },
    {
      route: "/api/users",
      method: "POST",
      auth: true,
      action: (req, res) => {
        utils.db.findUser({ username: "testing" }, (err, user) => {
          res.send(err ? { status: "error" } : user);
        });
      },
    },
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
