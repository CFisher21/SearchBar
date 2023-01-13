const dal = require('./pgdb')

var getSearch = async function(search) {
     const sql = "SELECT * FROM mock_data WHERE first_name LIKE  INITCAP($1) or last_name LIKE INITCAP($1) or email LIKE $1 or occupation LIKE INITCAP($1)"
     // the line below is to take the search term and build it into "search%", this makes the user not need to input the EXACT name/email/occupation to get a result.
     const fuzzy = `${search}%`
     const results = await dal.query(sql, [fuzzy]);
     return results.rows;
}

module.exports = {getSearch}