const cookieParser = require("cookie-parser");
// allows access of cookies across routes even those that do not have
const cookieParserMiddleware = cookieParser();

module.exports = cookieParserMiddleware;
