const dal = require('./pgdb')

var getSearch = async function(search, searchby) {

     // the line below is to take the search term and build it into "search%", this makes the user not need to input the EXACT name/email/occupation to get a result.
     const fuzzy = `${search}%`
    if(searchby == "firstname") {
     const sql = "SELECT * FROM mock_data WHERE first_name LIKE  INITCAP($1)"
     const results = await dal.query(sql, [fuzzy]);
     return results.rows;

    } else if (searchby == "lastname") {
     const sql = "SELECT * FROM mock_data WHERE last_name LIKE INITCAP($1)"
     const results = await dal.query(sql, [fuzzy]);
     return results.rows;

    } else if (searchby == "email") {
     const sql = "SELECT * FROM mock_data WHERE email LIKE $1"
     const results = await dal.query(sql, [fuzzy]);
     return results.rows;

    } else {
     const sql = "SELECT * FROM mock_data WHERE occupation LIKE INITCAP($1)"
     const results = await dal.query(sql, [fuzzy]);
     return results.rows;
}

}

module.exports = {getSearch}