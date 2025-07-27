const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Define allowed origins with environment validation
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PRODUCTION, // Add production client URL
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost:3000", // HTTPS localhost for testing
].filter(Boolean); // Remove undefined values

// Enhanced CORS middleware for cross-domain production
const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, be more permissive
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Essential for cross-domain cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"], // Allow client to see Set-Cookie header
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false,
});

module.exports = corsMiddleware;
