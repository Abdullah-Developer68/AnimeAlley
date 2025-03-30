const express = require("express");

//Middleware for parsing URL-encoded bodies (as sent by HTML forms)
//extended: true allows for parsing of nested objects
//limit: controls the maximum request body size (default: '100kb')
const urlEncodedParser = express.urlencoded({
  extended: true, // Allows for rich objects and arrays to be encoded
  limit: "50mb", // Sets maximum request body size
});

module.exports = urlEncodedParser;
