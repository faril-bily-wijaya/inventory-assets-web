const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });
async function main() {
  const updateStatus = await pool.query("UPDATE devices SET status = 'AKTIF' WHERE status = 'OPERATIONAL'");
  console.log(`Updated ${updateStatus.rowCount} devices from OPERATIONAL to AKTIF.`);
  
  const updateCondition = await pool.query("UPDATE devices SET condition = 'NORMAL' WHERE condition IS NULL");
  console.log(`Updated ${updateCondition.rowCount} devices with null condition to NORMAL.`);
}
main().finally(() => pool.end());
