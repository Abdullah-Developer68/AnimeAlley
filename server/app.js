const express = require("express");
const dbConnect = require("./config/dbConnect.js");
const dotenv = require("dotenv");
const passport = require("./config/passport.js"); // Initialize Passport configuration

dotenv.config(); // Load environment variables from .env file
const path = require("path"); // Use path module for file paths
const port = process.env.PORT;
const app = express();

// Stripe webhook must be registered before any body parser middleware because Stripe webhooks
// must use raw body parsing while regular API routes use JSON body parsing to handle requests
//  and so that is why it is not in strip.routes.js
const {
  handleStripeWebhook,
} = require("./controllers/stripeWebHook.controller.js");

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Import middlewares and executes them
require("./middlewares/index.middleware.js")(app);
require("./utils/cleanUp.js"); // automaically cleans unverified users that were created a Week Ago

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

// Remove or comment out this line for Vercel:
// app.listen(port, () => {
//   console.log(`Server is running at: http://localhost:${port}`);
// });

module.exports = app; // <-- Add this line for Vercel
