const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendOTP = require("../utils/sendOTP.js");
const dbConnect = require("../config/dbConnect.js");

dotenv.config();

const secretKey = process.env.JWT_KEY;

const makNSenOTP = async (req, res) => {
  dbConnect();
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

  let user = await userModel.findOne({ email });
  if (!user) {
    // Create new user with verifying role and required fields
    user = await userModel.create({
      email,
      otp,
      otpExpiry,
      role: "verifying",
      username: "temp",
      password: "N/A",
    });
  } else {
    // If user exists
    res.status(409).json({
      message: "Your account already exists, so you should just login!",
    });
  }
  await sendOTP(email, otp);
  res.status(200).json({ message: "OTP sent" });
};

const verifyOTP = async (req, res) => {
  dbConnect();
  const { email, otp } = req.body;
  const user = await userModel.findOne({ email, role: "verifying" });
  if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  // OTP verified - do NOT clear otp/otpExpiry yet
  res.status(200).json({ message: "OTP verified" });
};

const signUp = async (req, res) => {
  dbConnect();
  try {
    const { email, password, username } = req.body;
    // Find user with role verifying
    const user = await userModel.findOne({ email, role: "verifying" });
    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "No pending verification for this email. Please start signup again.",
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update user fields and set role to user
    user.username = username;
    user.password = hashedPassword;
    user.role = "user";
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    // Create token and sign in
    const token = jwt.sign({ userid: user._id, email }, secretKey);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on Vercel
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "lax" for development
      path: "/",
      domain: process.env.DOMAIN || undefined, // set if using custom domain or subdomain
    });
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  dbConnect();
  try {
    const { email, password } = req.body;
    // Check if user exists
    const userExist = await userModel.findOne({ email });

    // If user exists, compare password
    if (!userExist) {
      return res
        .status(401)
        .json({ success: false, status: false, message: "User not found!" });
    }

    // Check if user was registered through Google (no password but has googleId)
    if (
      (!userExist.password || userExist.password === "N/A") &&
      userExist.googleId
    ) {
      return res.status(400).json({
        success: false,
        status: false,
        message:
          "You are registered through Google. Please use Google login to sign in.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: false,
        message: "Either email or password is incorrect!",
      });
    }

    // Create token and send as cookie
    const token = jwt.sign(
      { email: userExist.email, userid: userExist._id },
      secretKey
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on Vercel
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "lax" for development
      path: "/",
      domain: process.env.DOMAIN || undefined, // set if using custom domain or subdomain
    });

    const user = {
      id: userExist._id,
      username: userExist.username,
      email: userExist.email,
      role: userExist.role,
      profilePic: userExist.profilePic,
    };

    // Send login success response
    res.status(200).json({
      success: true,
      user,
      message: "You have been logged in!",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Unauthorized!" });
  }
};

const logout = (req, res) => {
  // Clear the cookie by setting an expiry in the past
  res.cookie("token", "", { expires: new Date(0) });
  res.redirect("/");
};

//  helps to stay logged in even after refreshing the page
const verifyToken = async (req, res) => {
  dbConnect();
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await userModel.findById(decoded.userid);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = { makNSenOTP, verifyOTP, signUp, login, logout, verifyToken };
