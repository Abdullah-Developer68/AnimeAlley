const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI; // Should include your credentials and cluster info, but not the db name

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db; // Reuse existing connection
  try {
    await client.connect();
    db = client.db("AnimeAlley"); // Use your database name here
    console.log("Connected to MongoDB (AnimeAlley)");
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

module.exports = { connectDB, client };
