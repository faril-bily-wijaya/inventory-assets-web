const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
async function main() {
  const res = await pool.query("SELECT device_code, status FROM devices WHERE device_code = 'TIF1-SPN-01-0001-00002'");
  console.log('DEVICE STATUS:', res.rows);
}
main().finally(() => pool.end());
