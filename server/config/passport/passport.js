const passport = require("passport");
const GoogleProvider = require("./Strategies/GoogleStrategy.js");

// console.log("Configuring Passport");

// Use Google OAuth strategy
passport.use(GoogleProvider);

module.exports = passport;
