const session = require("express-session");

const expSession = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",

  // resave: false
  // If true: The session is saved to the database on every request, even if nothing changed. (This wastes resources.)
  // If false: The session is only saved when something changes, making it more efficient.
  resave: false,

  // saveUninitialized: false
  // If true: A new session is created and saved even if there's no data in it. (Can fill up the database with empty sessions.)
  // If false: A session is only created when there's actual data to save, preventing unnecessary storage.

  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    // Set `true` if using HTTPS
  },
  name: "session-id",
});

module.exports = expSession;
