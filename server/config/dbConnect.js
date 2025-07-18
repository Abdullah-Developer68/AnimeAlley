const mongoose = require("mongoose");
const dotenv = require("dotenv");
//loads variables from .env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "AnimeAlley"; // fallback if not set

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME, // <--- Specify your database name here
    });
    console.log(
      "Connected to MongoDB:",
      mongoose.connection.host,
      "DB:",
      DB_NAME
    );
  } catch (error) {
    console.log("Error Connecting to Mongo DB!");
    console.log(error);
  }
};

module.exports = dbConnect;
