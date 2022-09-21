const Pool = require('pg').Pool;

const pool = new Pool({
    user: "qap3",
    host: 'localhost',
    password: "1234",
    database: "sprint02",
    port: 5432,
});

module.exports = pool;