const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");

const DB_NAME = "users";

const init = (location) => {
  const adapter = new FileSync(location);
  const db = low(adapter);

  db.defaults({
    users: [],
  }).write();

  const findUser = ({ username, id, token }, done) => {
    let res;

    if (username) {
      res = db
        .get(DB_NAME)
        .filter({ username: username.toLowerCase() })
        .value();
    } else if (id) {
      res = db.get(DB_NAME).filter({ id }).value();
    } else if (token) {
      res = db.get(DB_NAME).filter({ token }).value();
    }

    if (res && res.length) {
      return done(null, res[0]);
    }
    return done(1);
  };

  const updateUser = ({ username, ...rest }, done) => {
    const pos = db.get(DB_NAME).find({ username: username.toLowerCase() });
    const user = pos.value();

    if (user) {
      pos
        .assign({
          ...rest,
        })
        .write();

      return done(null, user);
    }
    return 1;
  };

  const addUser = (
    { username, encryptedPassword, salt, token, active },
    done
  ) => {
    const id = nanoid();

    db.get(DB_NAME)
      .push({
        active,
        encryptedPassword,
        id: `${username}-${id}`,
        salt,
        token,
        username: username.toLowerCase(),
      })
      .write();
    return done(null, username);
  };

  return {
    addUser,
    findUser,
    updateUser,
  };
};

module.exports = {
  init,
};
