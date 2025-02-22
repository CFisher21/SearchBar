// Require the pgdb module to interact with PostgreSQL database
const dal = require('./pgdb')

// Define an asynchronous function to get search results based on search term and search category
var getSearch = async function(search, searchby) {

  // Build the search term into a fuzzy search pattern with "%"
  const fuzzy = `${search}%`

  // Based on the selected search category, construct a SQL query to retrieve matching records from the mock_data table in the PostgreSQL database
  if(searchby == "firstname") {
    const sql = "SELECT * FROM clients WHERE firstname LIKE  INITCAP($1)"
    const results = await dal.query(sql, [fuzzy]);
    return results.rows;

  } else if (searchby == "lastname") {
    const sql = "SELECT * FROM clients WHERE lastname LIKE INITCAP($1)"
    const results = await dal.query(sql, [fuzzy]);
    return results.rows;

  } else if (searchby == "email") {
    const sql = "SELECT * FROM clients WHERE email LIKE $1"
    const results = await dal.query(sql, [fuzzy]);
    return results.rows;

  } else {
    const sql = "SELECT * FROM clients WHERE occupation LIKE INITCAP($1)"
    const results = await dal.query(sql, [fuzzy]);
    return results.rows;
  }

}

// Export the getSearch function to make it available to other modules
module.exports = {getSearch}
