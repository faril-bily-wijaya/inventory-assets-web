const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:6543/postgres'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connected successfully:', res.rows[0]);
  }
  pool.end();
});
