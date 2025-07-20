const session = require("express-session");

// Middleware instance for express-session
const expSession = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false, // Save session only when modified
  saveUninitialized: false, // Don't save empty sessions
  cookie: {
    secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "none", // Consistent with auth cookies
    // domain: "localhost", // Set to your domain in production
  },
  name: "session-id",
});

module.exports = expSession;
