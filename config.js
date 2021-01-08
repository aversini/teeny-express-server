const path = require("path");
module.exports = {
  port: 3000,
  proxyPath: "/analytics",
  auth: {
    successRedirectTo: "/",
    notAuthenticatedRedirectTo: "/login",
    failureRedirectTo: "/login?auth=401",
  },
  database: (DB_TYPE) => ({
    type: DB_TYPE.LOWDB,
    location: path.join(process.cwd(), "db.json"),
  }),
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
