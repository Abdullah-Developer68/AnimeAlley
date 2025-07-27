const passport = require("../config/passport/passport.js");
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
  const clientUrl =
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : "http://localhost:5173";
  passport.authenticate("google", {
    failureRedirect: `${clientUrl}/login`,
    session: true,
  })(req, res, (err) => {
    if (err) {
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
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site & lax for same-site
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie("token", token, cookieOptions);
      return res.redirect(`${clientUrl}/`);
    }
    res.redirect(`${clientUrl}/login`);
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
 * 1. First checks for session-based authentication (req.isAuthenticated())
 * 2. If no session, checks for JWT token in cookies
 * 3. Sends user profile if authenticated via either method
 * 4. Handles error cases appropriately
 */
const sendUserData = async (req, res) => {
  dbConnect();
  try {
    // First check session-based authentication (Google OAuth)
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
      return;
    }

    // If no session, check for JWT token (for users who logged in via Google and got JWT)
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await require("../models/user.model.js").findById(
          decoded.userid
        );

        if (user) {
          res.status(200).json({
            success: true,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              profilePic: user.profilePic,
              role: user.role,
            },
          });
          return;
        }
      } catch (jwtError) {
        // ignore
      }
    }

    // No authentication found
    res.status(200).json({
      success: false,
      message: "Not authenticated",
    });
  } catch (error) {
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
