const session = require("express-session");

// Middleware instance for express-session
const expSession = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false, // Save session only when modified
  saveUninitialized: false, // Don't save empty sessions
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "lax", // Helps prevent CSRF attacks
    // domain: "localhost", // Set to your domain in production
  },
  name: "session-id",
});

module.exports = expSession;
