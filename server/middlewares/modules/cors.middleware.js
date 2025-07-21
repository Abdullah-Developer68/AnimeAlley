const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

// Simple CORS middleware
const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = corsMiddleware;
