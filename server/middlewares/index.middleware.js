// Import all middleware instances
const cookieParserMiddleware = require("./modules/cookieParser.middleware");
const corsMiddleware = require("./modules/cors.middleware");
const expSession = require("./modules/session.middleware");
const jsonParserMiddleware = require("./modules/jsonParser.middleware");
const urlEncodedParser = require("./modules/urlEncodedParser.middleware");
const morganMiddleware = require("./modules/morgan.middleware");

// Apply all middlewares with app instance
module.exports = (app) => {
  app.use(cookieParserMiddleware); // Cookie parser
  app.use(corsMiddleware); // CORS
  app.use(expSession); // express-session
  app.use(jsonParserMiddleware); // Parses JSON bodies
  app.use(urlEncodedParser); // Parses URL-encoded bodies
  app.use(morganMiddleware); // Logs requests for debugging
};
