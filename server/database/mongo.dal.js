
const dal = require("./mongodb");

async function mongoSearch(search) {
    
   try {
        await dal.connect()
        const mongoData = dal.db('test').collection('sprint2').find({$or: [{"first_name":`${search}`}, {"last_name":`${search}`}, {"email" : `${search}`}, {"position" : `${search}`} ]})
        const results = await mongoData.toArray()
        return results
        
     } catch(error) {
        console.log(error)
     }
    
}

module.exports = {mongoSearch}