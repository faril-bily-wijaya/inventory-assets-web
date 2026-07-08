const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
async function main() {
  const statuses = await pool.query('SELECT DISTINCT status FROM devices');
  const conditions = await pool.query('SELECT DISTINCT condition FROM devices');
  console.log('STATUSES:', statuses.rows.map(r => r.status));
  console.log('CONDITIONS:', conditions.rows.map(r => r.condition));
}
main().finally(() => pool.end());
