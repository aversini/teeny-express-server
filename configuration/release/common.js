/* eslint no-console:0 */
const isBoolean = require("lodash.isboolean");
const path = require("path");
const inquirer = require("inquirer");
const kleur = require("kleur");
const exec = require("shelljs").exec;

const cwd = process.cwd();
const data = require("./data");
const pkgFile = path.join(cwd, "package.json");
const pkgFileData = require(pkgFile);

const NB_SPACES_FOR_TAB = 2;
const ALLOWED_BRANCH = "master";
const CONFIG_FILE = ".release.config.js";

function parseConfig() {
  /**
   * Read config from .release.config.js to override
   * default values.
   *
   * module.exports = {
   *   dryRun: true,
   *   local: true,
   *   bump: {
   *     gitPush: true
   *   },
   *   release: {
   *     coverage: true,
   *     changelog: true,
   *     gitPush: true,
   *     bundlesize: true
   *   }
   * }
   */

  data.dryRun = false;
  data.local = false;
  data.allowedBranch = ALLOWED_BRANCH;
  data.release = {};
  data.bump = {};

  data.release.coverage = true;
  data.release.changelog = true;
  data.release.gitPush = true;
  data.release.bundlesize = false;

  data.bump.gitPush = true;

  try {
    const cfgFile = require(path.join(cwd, CONFIG_FILE));
    data.dryRun = cfgFile.dryRun;
    data.local = cfgFile.local;
    data.allowedBranch = cfgFile.allowedBranch || ALLOWED_BRANCH;
    if (cfgFile.release) {
      data.release = {};
      data.release.coverage = isBoolean(cfgFile.release.coverage)
        ? cfgFile.release.coverage
        : true;
      data.release.changelog = isBoolean(cfgFile.release.changelog)
        ? cfgFile.release.changelog
        : true;
      data.release.gitPush = isBoolean(cfgFile.release.gitPush)
        ? cfgFile.release.gitPush
        : true;
      data.release.bundlesize = isBoolean(cfgFile.release.bundlesize)
        ? cfgFile.release.bundlesize
        : false;
    }
    if (cfgFile.bump) {
      data.bump = {};
      data.bump.gitPush = isBoolean(cfgFile.bump.gitPush)
        ? cfgFile.bump.gitPush
        : true;
    }
  } catch (e) {
    // nothing to declare officer
  }
}

function parseArgs(argv) {
  data.dryRun = isBoolean(argv.dryRun) ? argv.dryRun : data.dryRun;
  data.local = isBoolean(argv.local) ? argv.local : data.local;
}

function checkForAdminRights(done) {
  const questions = {
    type: "confirm",
    name: "goodToGo",
    message: "Do you have admin rights to push to upstream?",
    default: false,
  };
  inquirer.prompt(questions).then(function (answers) {
    if (data.dryRun || data.local) {
      return done();
    }
    if (!answers.goodToGo) {
      console.log(
        kleur
          .bold()
          .red(
            "You cannot use this command if you do not have admin rights to push."
          )
      );
    }
    return done(!answers.goodToGo);
  });
}

function displayConfirmation(msg, done) {
  const questions = {
    type: "confirm",
    name: "goodToGo",
    message: "Do you want to continue?",
    default: true,
  };
  console.log();
  console.log(msg);
  console.log();
  inquirer.prompt(questions).then(function (answers) {
    done(!answers.goodToGo);
  });
}

function runCommand(command, opts = {}) {
  const prefix = [];
  if (opts.dryRun || opts.local) {
    if (opts.dryRun) {
      prefix.push("dry-run");
    }
    if (opts.local) {
      prefix.push("local-only");
    }
    console.log(`[${prefix.join("+")}] ${command}`);
    return {
      code: 0,
      stdout: "",
      stderr: "",
    };
  } else {
    const res = exec(command, { silent: !opts.verbose });
    return {
      code: res.code,
      stdout: res.code === 0 ? res.stdout.replace(/\n$/, "") : null,
      stderr: res.stderr,
    };
  }
}

function getCurrentVerion() {
  data.pkgFile = pkgFile;
  data.currentVersion = pkgFileData.version;
}

function getCurrentBranch() {
  if (!data.currentBranch) {
    data.currentBranch = runCommand("git rev-parse --abbrev-ref HEAD").stdout;
  }
}

function getCurrentRemote() {
  if (!data.currentRemote) {
    const res = runCommand(
      "git rev-parse --symbolic-full-name --abbrev-ref @{u}"
    );
    if (res.code === 0 && res.stdout) {
      data.currentRemote = res.stdout.split("/")[0];
    } else {
      data.currentRemote = res.stdout;
    }
  }
}

function gitDirty() {
  return runCommand("git diff-index --name-only HEAD --exit-code").code;
}

function gitStage(file, done) {
  runCommand(`git add ${file}`, { dryRun: data.dryRun });
  done();
}

function gitCommit(message, done) {
  runCommand(`git commit -m "${message}"`, { dryRun: data.dryRun });
  done();
}

function gitTag(done) {
  runCommand(
    `git tag -a v${data.currentVersion} -m "version ${data.currentVersion}"`,
    {
      dryRun: data.dryRun,
    }
  );
  done();
}

function gitPushCode(done) {
  runCommand(
    `git push ${data.currentRemote} ${data.currentBranch} --no-verify`,
    {
      dryRun: data.dryRun,
      local: data.local,
    }
  );
  done();
}

function gitPushTag(done) {
  runCommand(
    `git push ${data.currentRemote} v${data.currentVersion} --no-verify`,
    {
      dryRun: data.dryRun,
      local: data.local,
    }
  );
  done();
}

function preflightValidation() {
  const errorMsg = [];

  // check if the current branch is ALLOWED_BRANCH
  if (data.currentBranch !== data.allowedBranch && !data.dryRun) {
    errorMsg.push(
      kleur.bold().red(`Working branch must be "${data.allowedBranch}".`)
    );
  }

  // check if the current branch has a tracking remote
  if (!data.currentRemote && !data.dryRun && !data.local) {
    errorMsg.push(kleur.bold().red("Tracking remote must be set."));
  }

  // Check if the current repository is dirty (uncommited files).
  if (gitDirty() && !data.dryRun) {
    errorMsg.push(kleur.bold().red("Working dir must be clean."));
  }

  if (errorMsg.length) {
    let shouldExit = false;
    errorMsg.forEach(function (err) {
      if (err) {
        shouldExit = true;
        console.log(err);
      }
    });
    if (shouldExit) {
      console.log();
      process.exit(1);
    }
  }
}

function displaySummary() {
  console.log();
  console.log("Current version is %s", kleur.cyan(data.currentVersion));
  console.log("Current branch is %s", kleur.cyan(data.currentBranch));
  console.log("Current tracking remote is %s", kleur.cyan(data.currentRemote));

  if (data.dryRun) {
    console.log(`Dry-run mode: ${kleur.cyan("true")}`);
  }
  if (data.local) {
    console.log(`Local-only mode: ${kleur.cyan("true")}`);
  }

  console.log();
}

module.exports = {
  NB_SPACES_FOR_TAB,
  data,
  parseConfig,
  parseArgs,
  getCurrentVerion,
  getCurrentBranch,
  getCurrentRemote,
  displaySummary,
  displayConfirmation,
  preflightValidation,
  checkForAdminRights,
  runCommand,
  gitStage,
  gitCommit,
  gitPushCode,
  gitTag,
  gitPushTag,
};
