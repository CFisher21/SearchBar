const dal = require('./pgdb')

var getSearch = async function(search) {
     const sql = "SELECT * FROM mock_data WHERE first_name = $1 or last_name = $1 or email = $1 or occupation = $1"
     const results = await dal.query(sql, [search]);
     return results.rows;
}

module.exports = {getSearch}