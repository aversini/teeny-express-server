const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");

const init = (location) => {
  const adapter = new FileSync(location);
  const db = low(adapter);

  db.defaults({
    users: [],
  }).write();

  const findUser = ({ username, id }, done) => {
    const res = username
      ? db.get("users").filter({ name: username }).value()
      : db.get("users").filter({ id }).value();
    if (res.length) {
      return done(null, res[0]);
    }
    return done(1);
  };

  const addUser = ({ username, encryptedPassword, salt }, done) => {
    const id = nanoid();

    db.get("users")
      .push({
        id: `${username}-${id}`,
        active: true,
        name: username,
        encryptedPassword,
        salt,
      })
      .write();
    return done(null, username);
  };

  return {
    addUser,
    findUser,
  };
};

module.exports = {
  init,
};
