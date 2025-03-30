const express = require("express");
// Parses incoming JSON requests and converts it into a JavaScript object
// Makes the parsed data available in req.body
const jsonParserMiddleware = express.json();

module.exports = jsonParserMiddleware;
