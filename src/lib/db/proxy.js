const argv = require("yargs").help("info").argv;
const path = require("path");

const config = argv.config
  ? require(path.join(process.cwd(), `./${argv.config}`))
  : null;

const DB_TYPE = {
  LOWDB: "lowdb",
};

let db;
if (config.database(DB_TYPE).type === DB_TYPE.LOWDB) {
  db = require("./lowdb").init(config.database(DB_TYPE).location);
}

module.exports = {
  DB_TYPE,
  addUser: db.addUser,
  findUser: db.findUser,
};
