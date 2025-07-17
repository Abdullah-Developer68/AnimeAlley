const cors = require("cors");

// Middleware instance for CORS
const corsMiddleware = cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
});

module.exports = corsMiddleware;
