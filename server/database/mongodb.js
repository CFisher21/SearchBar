const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://test:test123@newcluster.adhcw.mongodb.net/?retryWrites=true&w=majority";
const pool = new MongoClient(uri);

module.exports = pool;