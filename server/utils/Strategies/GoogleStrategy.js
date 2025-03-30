const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/user.model");
require("dotenv").config();

const findOrCreateUser = async (profile) => {
  try {
    // console.log("Google Auth Callback Triggered", { profileId: profile.id });
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // console.log("Creating new user with Google profile");
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        profilePic: profile.photos[0].value,
      });
    }

    return user;
  } catch (error) {
    console.error("Google Strategy Error:", error);
    throw error;
  }
};

const GoogleProvider = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);

module.exports = GoogleProvider;
