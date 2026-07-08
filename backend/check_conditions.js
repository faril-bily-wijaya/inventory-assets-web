const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
async function main() {
  const res = await pool.query("SELECT condition, count(*) FROM devices GROUP BY condition");
  console.log('CONDITIONS IN DB:', res.rows);
}
main().finally(() => pool.end());
