const { nanoid } = require("nanoid");
const User = require("./user").User;

const init = () => {
  const findUser = ({ username, id, token }, done) => {
    if (username) {
      User.findOne({ username }, function (err, user) {
        err = user ? null : 1;
        done(err, user);
      });
    } else if (id) {
      User.findOne({ id }, function (err, user) {
        err = user ? null : 1;
        done(err, user);
      });
    } else if (token) {
      User.findOne({ token }, function (err, user) {
        err = user ? null : 1;
        done(err, user);
      });
    }
  };

  const updateUser = ({ username, ...rest }, done) => {
    User.updateOne({ username }, rest, (err, data) => {
      done(err, data);
    });
  };

  const addUser = (
    { username, encryptedPassword, salt, token, active },
    done
  ) => {
    const id = nanoid();
    const newUser = new User({
      id: `${username}-${id}`,
      active,
      username: username.toLowerCase(),
      encryptedPassword,
      salt,
      token,
    });
    newUser.save((err) => {
      done(err, newUser);
    });
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
