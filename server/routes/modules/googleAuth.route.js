const express = require("express");
const router = express.Router();
const passport = require("../../config/passport/passport.js");

const {
  LogoutFromGoogle,
  initiateGoogleAuth,
  handleGoogleCallback,
  sendUserData,
} = require("../../services/googleAuth.js");

// Route to initiate Google OAuth
router.get("/login", (req, res, next) => {
  initiateGoogleAuth(req, res, next);
});

// Google OAuth callback route
router.get("/callback", (req, res, next) => {
  handleGoogleCallback(req, res, next);
});

// Logout route
router.get("/logout", LogoutFromGoogle);

// Route to check authentication status and get user data
router.get("/success", sendUserData);

// Failed authentication route
router.get("/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Failed to authenticate" });
});

module.exports = router;
