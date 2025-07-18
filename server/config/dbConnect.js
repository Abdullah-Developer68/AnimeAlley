const mongoose = require("mongoose");

// Database name
const DB_NAME = "AnimeAlley";

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log(`Already connected to MongoDB (${DB_NAME})`);
      return mongoose.connection;
    }

    // Connect to MongoDB with explicit database name
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME, // Explicitly specify the database name
      // Modern Mongoose doesn't need most of the old options
      // as they're now defaults or deprecated
    });

    console.log(`Connected to MongoDB (${DB_NAME}) via Mongoose`);
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during MongoDB disconnection:", err);
    process.exit(1);
  }
});

module.exports = { connectDB, mongoose };
