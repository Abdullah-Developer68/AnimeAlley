const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Define allowed origins for both development and production
const allowedOrigins = [
  process.env.CLIENT_URL, // Production frontend
  "http://localhost:5173", // Local dev fallback
  "http://localhost:3000", // Alternative local port
];

// Middleware instance for CORS
const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
});

module.exports = corsMiddleware;
