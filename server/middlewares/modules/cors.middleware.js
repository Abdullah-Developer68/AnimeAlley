const cors = require("cors");

// Middleware instance for CORS
const corsMiddleware = cors({
  origin: "https://anime-alley-beige.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
});

module.exports = corsMiddleware;
