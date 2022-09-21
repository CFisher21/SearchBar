const mdal = require("./mongodb");
const pdal = require('./pgdb')

async function bothSearch(search) {
    try{
        await mdal.connect()
        const mongoData = mdal.db('test').collection('sprint2').find({$or: [{"first_name":`${search}`}, {"last_name":`${search}`}, {"email" : `${search}`}, {"position" : `${search}`} ]})
        const moresults = await mongoData.toArray()
        
        const sql = "SELECT * FROM mock_data WHERE first_name = $1 or last_name = $1 or email = $1 or occupation = $1"
        const pgresults = await pdal.query(sql, [search]);
     
        const results = moresults.concat(pgresults.rows)
        return results
    } catch(error) {
        console.log(error)
    }
}

bothSearch('Paulie')

module.exports = {bothSearch}