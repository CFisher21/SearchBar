// Require the pg module to interact with PostgreSQL database
const Pool = require('pg').Pool;

// Create a new Pool object to manage a connection pool to the PostgreSQL database
const pool = new Pool({
    user: "postgres",        // The PostgreSQL user to connect as
    host: 'caboose.proxy.rlwy.net',   // The hostname of the PostgreSQL database server
    password: "oouVDNcPqEuLxiSUTAlXyiZYFNyTYJhx",    // The password to use when connecting to the PostgreSQL server
    database: "railway", // The name of the PostgreSQL database to use
    port: 11341,          // The port number that the PostgreSQL server is listening on
});

// Export the pool object to make it available to other modules
module.exports = pool;
