const fs = require("fs");
const path = require("path");

const fileStub = fs.readFileSync(
  path.resolve(__dirname, "./tilemaps.bgat"),
  "utf-8"
);

module.exports = { fileStub };
