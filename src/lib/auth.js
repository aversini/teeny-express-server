const utils = require("./utils");
const constants = require("../config/constants");
const strings = constants.STRINGS;

const prepareForRegistration = ({ username, password, active }, done) => {
  utils.encryptString(password, null, (err, data) => {
    if (err) {
      return done(err);
    }
    utils.db.findUser({ username }, (_err, user) => {
      if (user) {
        return done(constants.HTTP_FORBIDDEN, strings.ACCOUNT_IN_USE);
      }
      const SMALL_TOKEN = 16;
      const token = utils.generateSalt(SMALL_TOKEN);
      utils.db.addUser(
        {
          username: username.toLowerCase(),
          encryptedPassword: data.encryptedString,
          salt: data.salt,
          active,
          token: active ? "" : token,
        },
        (err, user) => {
          if (!err && user) {
            return done(null, "", token);
          }
          done(constants.HTTP_SERVER_ERROR, strings.INTERNAL_ERROR);
        }
      );
    });
  });
};

const updatePasswordWithToken = ({ username, password, token }, done) => {
  utils.encryptString(password, null, (err, data) => {
    if (err) {
      return done(err);
    }
    utils.db.findUser({ username }, (_err, user) => {
      if (!user || user.token !== token) {
        return done(constants.HTTP_FORBIDDEN, strings.INTERNAL_ERROR);
      }
      utils.db.updateUser(
        {
          username: username.toLowerCase(),
          encryptedPassword: data.encryptedString,
          salt: data.salt,
          token: null,
          active: true,
        },
        (err, user) => {
          if (!err && user) {
            return done(null, user.id);
          }
          done(constants.HTTP_SERVER_ERROR, strings.INTERNAL_ERROR);
        }
      );
    });
  });
};

const prepareForPasswordReset = ({ username }, done) => {
  utils.db.findUser({ username }, (err) => {
    if (err) {
      return done(constants.HTTP_SERVER_ERROR, strings.INTERNAL_ERROR);
    }
    const SMALL_TOKEN = 16;
    const token = utils.generateSalt(SMALL_TOKEN);
    utils.db.updateUser(
      {
        username: username.toLowerCase(),
        token,
        active: true,
      },
      (err, user) => {
        if (!err && user) {
          return done(null, "", token);
        }
        done(constants.HTTP_SERVER_ERROR, strings.INTERNAL_ERROR);
      }
    );
  });
};

const activate = (token, done) => {
  utils.db.findUser({ token }, (err, user) => {
    if (err) {
      return done(err);
    }
    utils.db.updateUser(
      { username: user.name, token: "", active: true },
      (err) => done(err)
    );
  });
};

const authenticate = ({ username, password }, done) => {
  utils.db.findUser({ username }, function (err, user) {
    if (err) {
      return done(constants.HTTP_UNAUTHORIZED, false, {
        message: strings.BAD_CREDENTIALS,
      });
    }
    if (!user) {
      return done(constants.HTTP_UNAUTHORIZED, false, {
        message: strings.BAD_CREDENTIALS,
      });
    }

    if (user && !user.active) {
      return done(constants.HTTP_UNAUTHORIZED, false, {
        message: strings.NOT_ACTIVE_YET,
      });
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

const getActivationURL = ({ host, token }) =>
  `${host}/activate/new?token=${token}`;

const getResetPasswordURL = ({ host, token }) =>
  `${host}/activate/reset?token=${token}`;

module.exports = {
  activate,
  authenticate,
  getActivationURL,
  getResetPasswordURL,
  prepareForRegistration,
  prepareForPasswordReset,
  updatePasswordWithToken,
};
