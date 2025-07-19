const passport = require("../config/passport.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const dbConnect = require("../config/dbConnect.js");

/**
 * Step 1: Initial Authentication
 * Initiates the Google OAuth flow by redirecting to the consent screen.
 *
 * When the user clicks "Login with Google":
 * 1. Redirects to Google's authentication page
 * 2. Asks for permission to access profile and email
 * 3. No data verification yet - just requesting access
 */
const initiateGoogleAuth = (req, res, next) => {
  // passport.authenticate() returns a middleware function that needs to be executed
  // We execute it immediately with the current request context (req, res, next) Passport.js handles all the logic required
  // if the middleware is not executed then the authentication process will not start
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

/**
 * Step 2: Handle OAuth Callback
 * Processes the response after Google authenticates the user.
 *
 * Flow:
 * 1. Google redirects back with an authorization code
 * 2. Passport exchanges this code for access tokens
 * 3. Creates/updates user session
 * 4. Establishes authentication state
 */
const handleGoogleCallback = (req, res, next) => {
  dbConnect();
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  })(req, res, (err) => {
    if (err) {
      console.error("Google Auth Error:", err);
      return next(err);
    }

    if (req.user) {
      // User is authenticated, create a JWT token
      const token = jwt.sign(
        {
          userid: req.user._id,
          email: req.user.email,
          profilePic: req.user.profilePic,
          role: req.user.role,
        },
        process.env.JWT_KEY
      );
      // Set the token in a cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.redirect(`${process.env.CLIENT_URL}/`);
    }
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
};

/**
 * Logout Function
 * Handles the complete logout process.
 *
 * Steps:
 * 1. Clears the user session
 * 2. Destroys session data
 * 3. Removes session cookie
 * 4. Redirects to home page
 */
const LogoutFromGoogle = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to Logout" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error destroying session" });
        }
        res.clearCookie("connect.sid");
        res.redirect(process.env.CLIENT_URL);
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Send User Data
 * Provides authenticated user information to the client.
 *
 * Process:
 * 1. Verifies user authentication
 * 2. Sends user profile if authenticated
 * 3. Handles error cases appropriately
 */
const sendUserData = async (req, res) => {
  dbConnect();
  try {
    if (req.isAuthenticated() && req.user) {
      res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          profilePic: req.user.profilePic,
          role: req.user.role,
        },
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Not authenticated",
      });
    }
  } catch (error) {
    console.error("Error in sendUserData:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  initiateGoogleAuth,
  LogoutFromGoogle,
  handleGoogleCallback,
  sendUserData,
};
