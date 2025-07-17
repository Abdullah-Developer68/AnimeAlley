const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv");
const passport = require("./config/passport"); // Initialize Passport configuration

dotenv.config(); // Load environment variables from .env file
const path = require("path"); // Use path module for file paths
const port = process.env.PORT;
const app = express();

// Stripe webhook must be registered before any body parser middleware
const {
  handleStripeWebhook,
} = require("./controllers/stripeWebhook.controller");

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Import middlewares and executes them
require("./middlewares/index.middleware.js")(app);
require("./utils/cleanUp"); // automaically cleans unverified users that were created a Week Ago

// Custom middlewares
app.use(passport.initialize());
app.use(passport.session());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files from the "uploads" directory

// Import all routes
const routes = require("./routes/index.routes.js");

dbConnect();

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
