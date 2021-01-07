module.exports = {
  set pkgFile(val) {
    this.all.pkgFile = val;
  },
  get pkgFile() {
    return this.all.pkgFile;
  },
  set dryRun(val) {
    this.all.dryRun = val;
  },
  get dryRun() {
    return this.all.dryRun;
  },
  set local(val) {
    this.all.local = val;
  },
  get local() {
    return this.all.local;
  },
  set currentVersion(val) {
    this.all.currentVersion = val;
  },
  get currentVersion() {
    return this.all.currentVersion;
  },
  set nextRC(val) {
    this.all.nextRC = val;
  },
  get nextRC() {
    return this.all.nextRC;
  },
  set nextPatch(val) {
    this.all.nextPatch = val;
  },
  get nextPatch() {
    return this.all.nextPatch;
  },
  set nextVersion(val) {
    this.all.nextVersion = val;
  },
  get nextVersion() {
    return this.all.nextVersion;
  },
  set currentBranch(val) {
    this.all.currentBranch = val;
  },
  get currentBranch() {
    return this.all.currentBranch;
  },
  set currentRemote(val) {
    this.all.currentRemote = val;
  },
  get currentRemote() {
    return this.all.currentRemote;
  },
  all: {},
};
