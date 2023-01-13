
const dal = require("./mongodb");

async function mongoSearch() {
    
   try {
        await dal.connect()
        const mongoData = dal.db('SearchBar').collection('sprint2').find({})
        const results = await mongoData.toArray()
        return results
        
     } catch(error) {
        console.log(error)
     }
    
}

module.exports = {mongoSearch}