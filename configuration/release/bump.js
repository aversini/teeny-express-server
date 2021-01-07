/* eslint no-console:0 */
const fs = require("fs-extra");
const semver = require("semver");
const inquirer = require("inquirer");
const async = require("async");
const kleur = require("kleur");
const path = require("path");
const common = require("./common.js");

const pkgLockFile = path.join(process.cwd(), "package-lock.json");

const BUMP_TYPE_RC = "type_rc";
const BUMP_TYPE_PATCH = "patch";
const BUMP_TYPE_MINOR = "minor";
const BUMP_TYPE_CUSTOM = "type_custom";

function getNextPossibleVersions(done) {
  /**
   * - if the current version is an RC
   *   - if we want to bump as a RC, it's a prelease:
   *     3.0.1-rc.1 -> 3.0.1-rc.2
   *     3.1.1-rc.1 -> 3.1.1-rc.2
   *   - if we want to bump as a final, it's not a RC anymore:
   *     3.0.1-rc.1 -> 3.0.1
   *     3.1.1-rc.1 -> 3.1.1
   *
   * - if the current version is a final (non-RC)
   *   - if we want to bump as a RC, it's a prerelease:
   *     3.0.1 -> 3.0.2-rc.0
   *     3.1.0 -> 3.1.1-rc.0
   *   - if we want to bump as a final, it's a patch:
   *     3.0.1 -> 3.0.2
   *     3.1.0 -> 3.1.1
   */

  common.data.nextRC = semver.inc(
    common.data.currentVersion,
    "prerelease",
    "rc"
  );
  common.data.nextPatch = semver.inc(common.data.currentVersion, "patch");
  common.data.nextMinor = semver.inc(common.data.currentVersion, "minor");

  return done();
}

function updatePackageJson(done) {
  if (!common.data.dryRun) {
    const data = JSON.parse(fs.readFileSync(common.data.pkgFile, "utf8"));
    data.version = common.data.nextVersion;
    if (common.data.npmTag && data.publishConfig) {
      data.publishConfig.tag = common.data.npmTag;
    }
    fs.writeFileSync(
      common.data.pkgFile,
      JSON.stringify(data, null, common.NB_SPACES_FOR_TAB).concat("\n")
    );
  }
  return done();
}

function updatePackageLockJson(done) {
  if (!common.data.dryRun) {
    try {
      const data = JSON.parse(fs.readFileSync(pkgLockFile, "utf8"));
      data.version = common.data.nextVersion;
      fs.writeFileSync(
        pkgLockFile,
        JSON.stringify(data, null, common.NB_SPACES_FOR_TAB).concat("\n")
      );
    } catch (e) {
      /**
       *  Ignoring silently...
       *  Maybe there is no package-lock.json?
       */
    }
  }
  return done();
}

function chooseTypeOfBump(done) {
  const questions = {
    type: "list",
    name: "action",
    message: "Please choose one of the following options for version",
    default: BUMP_TYPE_MINOR,
    choices: [
      {
        value: BUMP_TYPE_RC,
        short: "rc",
        name: `[rc] ...... bump to next RC (${common.data.nextRC})`,
      },
      {
        value: BUMP_TYPE_PATCH,
        short: "patch",
        name: `[patch] ... bump to next patch (${common.data.nextPatch})`,
      },
      {
        value: BUMP_TYPE_MINOR,
        short: "minor",
        name: `[minor] ... bump to next minor (${common.data.nextMinor})`,
      },
      {
        value: BUMP_TYPE_CUSTOM,
        short: "custom",
        name: "[custom] .. enter your own custom version",
      },
    ],
  };
  inquirer.prompt(questions).then(function (answers) {
    if (answers.action === BUMP_TYPE_RC) {
      common.data.nextVersion = common.data.nextRC;
      return done(null);
    } else if (answers.action === BUMP_TYPE_PATCH) {
      common.data.nextVersion = common.data.nextPatch;
      return done(null);
    } else if (answers.action === BUMP_TYPE_MINOR) {
      common.data.nextVersion = common.data.nextMinor;
      return done(null);
    } else {
      const questions = {
        type: "input",
        name: "version",
        message: "Type a valid semver version",
        default: common.data.nextRC,
        validate(val) {
          if (!val.length || !semver.valid(val)) {
            return "Please enter a valid semver version, or <ctrl-c> to quit...";
          }
          return true;
        },
      };
      inquirer.prompt(questions).then(function (answers) {
        common.data.nextVersion = answers.version;
        return done(null);
      });
    }
  });
}

function runTasks() {
  // need to increase version, commit and push
  async.waterfall(
    [
      function (done) {
        getNextPossibleVersions(done);
      },
      function (done) {
        common.checkForAdminRights(done);
      },
      function (done) {
        chooseTypeOfBump(done);
      },
      function (done) {
        common.displayConfirmation(
          `About to bump version from ${kleur.cyan(
            common.data.currentVersion
          )} to ${kleur.cyan(common.data.nextVersion)}`,
          done
        );
      },
      function (done) {
        updatePackageJson(done);
      },
      function (done) {
        updatePackageLockJson(done);
      },
      function (done) {
        common.gitStage(common.data.pkgFile, done);
      },
      function (done) {
        common.gitStage(pkgLockFile, done);
      },
      function (done) {
        common.gitCommit("chore: bumping version for next release", done);
      },
      function (done) {
        if (common.data.bump.gitPush) {
          common.gitPushCode(done);
        } else {
          return done();
        }
      },
    ],
    function (err) {
      process.exit(err);
    }
  );
}

module.exports = {
  runTasks,
};
