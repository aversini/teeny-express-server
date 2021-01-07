const utils = require("./utils");
const strings = require("../config/constants").STRINGS;

const prepareForSignup = (username, password, done) => {
  utils.encryptString(password, null, (err, data) => {
    if (err) {
      return done(err);
    }
    utils.db.findUser({ username }, (_err, user) => {
      if (user) {
        return done(1, strings.EMAIL_IN_USE);
      }
      const SMALL_TOKEN = 16;
      const token = utils.generateSalt(SMALL_TOKEN);
      utils.db.addUser(
        {
          username: username.toLowerCase(),
          encryptedPassword: data.encryptedString,
          salt: data.salt,
          active: false,
          token,
        },
        (err, user) => {
          if (user) {
            return done(null, "", token);
          }
          done(err, strings.INTERNAL_ERROR);
        }
      );
    });
  });
};

const authenticate = (username, password, done) => {
  utils.db.findUser({ username }, function (err, user) {
    if (err) {
      return done(null, false, { message: strings.BAD_CREDENTIALS });
    }
    if (!user) {
      return done(null, false, { message: strings.BAD_CREDENTIALS });
    }

    if (user && !user.active) {
      return done(null, false, { message: strings.NOT_ACTIVE_YET });
    }

    const options = {
      encryptedPassword: user.encryptedPassword,
      salt: user.salt,
    };
    utils.checkPassword({ password, ...options }, (err) => {
      if (err) {
        return done(null, false, { message: strings.BAD_CREDENTIALS });
      }
      /**
       * It's a valid login, need to reset the token
       * if there is a dangling one here...
       */
      if (user.token) {
        utils.db.updateUser(
          {
            username: username.toLowerCase(),
            token: null,
          },
          () => done(null, user)
        );
      } else {
        return done(null, user);
      }
    });
  });
};

module.exports = {
  authenticate,
  prepareForSignup,
};
