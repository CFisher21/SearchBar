const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:admin123@searchbar.ipl9gvt.mongodb.net/test";
const pool = new MongoClient(uri);

module.exports = pool;