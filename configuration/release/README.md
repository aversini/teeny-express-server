# Release Helper

This package provides very specific options to bump and release this package.
Depending on what you need to achieve, it can either create a release (git tag included), or simply bump your package version to the expected next version (npm tag included). The scripts are interactive and will ask you to confirm your choices.

Update the `package.json` file with the following scripts calls:
```json
"scripts": {
  "bump": "node ./configuration/release/index.js -t bump",
  "release": "node ./configuration/release/index.js -t release"
}
```

**NOTE**: The `release` script is expecting to run 2 other scripts, called `test:coverage` and `changelog`. Make sure they do exist before running the `release` script. You can also disable these targets in the configuration file called `.release.config.js` which must be placed at the root of this package.

## Usage

### Bump to the next version

```sh
$ npm run bump
```

### Tag the release

```sh
$ npm run release
```
