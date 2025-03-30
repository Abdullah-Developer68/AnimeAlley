const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secretKey = process.env.JWT_KEY;

const signUp = async (req, res) => {
  try {
    console.log("Received signup request body:", req.body);
    const { email, password, username } = req.body;

    // Check if user exists
    const userExist = await userModel.findOne({ email });

    if (userExist) {
      return res
        .status(409)
        .json({ status: false, message: "User already exists" });
    }

    // Generates salt and password
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Creates new user
      const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword,
      });

      // Creates token
      const token = jwt.sign({ userid: newUser._id, email }, secretKey);
      // Sends token to browser
      res.cookie("token", token);
      res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          profilePic: newUser.profilePic,
        },
      });
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return res.status(500).json({
        status: false,
        message: "Error while processing password",
      });
    }
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
  try {
    const { email, password } = req.body;
    // Check if user exists
    const userExist = await userModel.findOne({ email });

    // If user exists, compare password
    if (!userExist) {
      return res
        .status(401)
        .json({ status: false, message: "User not found!" });
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
    res.cookie("token", token);

    const user = {
      id: userExist._id,
      username: userExist.username,
      email: userExist.email,
      // profilePic: userExist.profilePic,
    };
    console.log(user);
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

module.exports = { signUp, login, logout };
