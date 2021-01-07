#!/usr/bin/env node
/* eslint-disable no-console */
const app = require("../src/config/express");

/**
 * Start the server on the provided port.
 */
app.listen(app.get("port"), () => {
  console.log(`Express is up and listening on port ${app.get("port")}`);
});
