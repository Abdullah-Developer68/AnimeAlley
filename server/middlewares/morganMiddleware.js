const morgan = require("morgan");

//used to track requests and their type (get,post etc) for debuggging
const morganMiddeware = morgan("dev");

module.exports = morganMiddeware;
