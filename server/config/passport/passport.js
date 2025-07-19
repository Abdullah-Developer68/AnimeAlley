const passport = require("passport");
const GoogleProvider = require("./Strategies/GoogleStrategy.js");
const userModel = require("../../models/user.model.js");

// console.log("Configuring Passport");

// Use Google OAuth strategy
passport.use(GoogleProvider);

/**
 * Serialization: Preparing user data for storage in the session
 *
 * Process:
 * 1. Called after successful authentication
 * 2. Takes the full user object and extracts just the user ID
 * 3. Stores only the user ID in the session to keep it light
 * 4. The ID will be used later to fetch the full user object when needed
 */
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user._id); // Only store user ID in session
});

/**
 * Deserialization: Reconstructing user data from session
 *
 * Process:
 * 1. Called on every request where session exists
 * 2. Takes the user ID from session
 * 3. Fetches complete user object from database using the ID
 * 4. Attaches user object to req.user for use in route handlers
 *
 * Note: This runs on every authenticated request, so keep it efficient
 */
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    const user = await userModel.findById(id);
    done(null, user); // Attach user to req.user
  } catch (error) {
    console.error("Deserialize Error:", error);
    done(error, null);
  }
});

module.exports = passport;
