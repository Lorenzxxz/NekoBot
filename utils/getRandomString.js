const crypto = require("crypto");

module.exports = (size) => crypto.randomBytes(size).toString("hex");
