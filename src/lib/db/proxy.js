const argv = require("yargs").help("info").argv;
const path = require("path");

const config = argv.config
  ? require(path.join(process.cwd(), `./${argv.config}`))
  : null;

const DB_TYPE = {
  LOWDB: "lowdb",
  MONGODB: "mongodb",
};

let db;
switch (config.database(DB_TYPE).type) {
  case DB_TYPE.LOWDB:
    db = require("./lowdb/lowdb").init(config.database(DB_TYPE).location);
    break;
  case DB_TYPE.MONGODB:
    db = require("./mongodb/mongodb").init();
    break;

  default:
    break;
}

module.exports = {
  DB_TYPE,
  addUser: db.addUser,
  findUser: db.findUser,
  updateUser: db.updateUser,
};
