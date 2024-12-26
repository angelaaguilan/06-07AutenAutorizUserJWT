const { Pool } = require('pg');

// Configuración del pool de conexión a PostgreSQL
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'sql123',
    database: 'softjobs',
    allowExitOnIdle: true
});

module.exports = pool