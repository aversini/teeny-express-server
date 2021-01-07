#!/usr/bin/env node

const argv = require("yargs").argv;
const common = require("./common");
const bump = require("./bump");
const release = require("./release");

common.parseConfig();
common.parseArgs(argv);
common.getCurrentVerion();
common.getCurrentBranch();
common.getCurrentRemote();
common.displaySummary();
common.preflightValidation();

if (argv.t === "release") {
  release.runTasks();
} else if (argv.t === "bump") {
  bump.runTasks();
}
