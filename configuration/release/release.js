/* eslint no-console:0 */
const async = require("async");
const common = require("./common.js");

function runCoverage(done) {
  if (!common.data.release.coverage) {
    return done();
  }
  const res = common.runCommand(`npm run test:coverage`, {
    verbose: true,
    dryRun: common.data.dryRun,
  });
  done(res.code);
}

function runChangelog(done) {
  if (!common.data.release.changelog) {
    return done();
  }
  const res = common.runCommand(`npm run changelog`, {
    verbose: true,
    dryRun: common.data.dryRun,
  });
  done(res.code);
}

function runBundlesize(done) {
  if (!common.data.release.bundlesize) {
    return done();
  }
  const res = common.runCommand(`npm run bundlesize -- -s`, {
    verbose: true,
    dryRun: common.data.dryRun,
  });
  done(res.code);
}

function runTasks() {
  /*
   * need to keep current version and test coverage,
   * generate changelog, tag the release (rc or not),
   * commit, and push
   */
  async.waterfall(
    [
      function (done) {
        common.checkForAdminRights(done);
      },
      function (done) {
        const msgCov = common.data.release.coverage ? "test coverage, " : "";
        const msgChangelog = common.data.release.changelog
          ? "generate changelog, "
          : "";
        const msgBundlesize = common.data.release.bundlesize
          ? "generate bundlesize, "
          : "";
        common.displayConfirmation(
          `About to ${msgCov}${msgChangelog}${msgBundlesize}tag and push...`,
          done
        );
      },
      function (done) {
        runCoverage(done);
      },
      function (done) {
        runChangelog(done);
      },
      function (done) {
        runBundlesize(done);
      },
      function (done) {
        /**
         * We couldn't get to that step if the directory had been
         * dirty to start with. Therefore, "git add ." is safe since
         * the only modified files are the ones that have been
         * modified by this very tool (changelog, bundlesize, etc.)
         */
        common.gitStage(".", done);
      },
      function (done) {
        common.gitCommit(
          `chore: tagging release ${common.data.currentVersion}`,
          done
        );
      },
      function (done) {
        common.gitTag(done);
      },
      function (done) {
        common.gitPushTag(done);
      },
      function (done) {
        common.gitPushCode(done);
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
