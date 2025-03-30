const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },

    // `email` is unique, meaning no two users can have the same email address
    email: { type: String, unique: true, required: true },

    password: {
      type: String,
      required: function () {
        //this keyword refers to the current document being validated
        return !this.googleId;
      },
    },

    profilePic: { type: String },

    // `googleId` is unique, ensuring no two users can have the same Google ID
    // `sparse: true` allows users who sign up without Google OAuth to omit this field (it's only enforced for Google users)
    googleId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true } //Automatically add createdAt & updatedAt
);

const User = mongoose.model("user", userSchema);

module.exports = User;
