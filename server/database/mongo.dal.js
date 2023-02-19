// Import the `dal` module
const dal = require("./mongodb");

// Define an asynchronous function named `mongoSearch`
async function mongoSearch() {
    try {
        // Connect to the MongoDB database using `dal.connect()`
        await dal.connect();

        // Retrieve all the documents in the "sprint2" collection using the `find()` method on the MongoDB collection object
        const mongoData = dal.db('SearchBar').collection('sprint2').find({});

        // Wait for the results to be converted into an array using the `toArray()` method
        const results = await mongoData.toArray();

        // Return the results as an array
        return results;
     } catch(error) {
        // If an error occurs during the execution of the function, it will be caught and logged to the console
        console.log(error);
     }
}

// Export an object containing only the `mongoSearch()` function
module.exports = {mongoSearch};
