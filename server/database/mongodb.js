// Import the `MongoClient` class from the `mongodb` module
const { MongoClient } = require('mongodb');

// Define a connection string for a MongoDB Atlas cluster
const uri = "mongodb+srv://admin:bluefeet1234@clients.keddl.mongodb.net/?retryWrites=true&w=majority&appName=Clients";

// Create a new `MongoClient` instance using the connection string
const pool = new MongoClient(uri);

// Export the `pool` object, which represents the MongoDB connection pool
module.exports = pool;
