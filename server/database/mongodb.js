// Import the `MongoClient` class from the `mongodb` module
const { MongoClient } = require('mongodb');

// Define a connection string for a MongoDB Atlas cluster
const uri = "mongodb+srv://admin:admin123@searchbar.ipl9gvt.mongodb.net/test";

// Create a new `MongoClient` instance using the connection string
const pool = new MongoClient(uri);

// Export the `pool` object, which represents the MongoDB connection pool
module.exports = pool;
