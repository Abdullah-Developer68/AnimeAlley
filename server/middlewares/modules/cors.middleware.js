const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Middleware instance for CORS
const corsMiddleware = cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
});

module.exports = corsMiddleware;
