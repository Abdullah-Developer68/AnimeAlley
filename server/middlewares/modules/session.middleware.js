const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();

// Middleware instance for express-session
const expSession = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false, // Save session only when modified
  saveUninitialized: false, // Don't save empty sessions
  cookie: {
    secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "lax" for development, "none" for production
    domain:
      process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined, // Set domain in production
  },
  name: "session-id",
});

module.exports = expSession;
