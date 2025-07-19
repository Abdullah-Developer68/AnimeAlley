const mongoose = require("mongoose");
const dotenv = require("dotenv");
//loads variables from .env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const dbConnect = async () => {
  try {
    await mongoose.connect(`${MONGODB_URI}`); // database name is in connection String

    console.log(
      "Connecting to MongoDB:",
      process.env.MONGODB_URI ? "URI found" : "URI NOT FOUND"
    );
  } catch (error) {
    console.log("Error Connecting to Mongo DB!");
    console.log(error);
  }
};

module.exports = dbConnect;
