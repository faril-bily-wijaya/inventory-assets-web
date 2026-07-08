import pg from 'pg'
const { Pool } = pg
const pool = new Pool({
  connectionString: 'postgresql://postgres.epqmzlnhculyqflbbulq:Inventoryassetsweb@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
})
async function main() {
  const regionals = await pool.query('SELECT * FROM regionals')
  const districts = await pool.query('SELECT * FROM districts')
  const clusters = await pool.query('SELECT * FROM clusters')
  console.log('Regionals:', regionals.rows)
  console.log('Districts:', districts.rows)
  console.log('Clusters:', clusters.rows)
}
main().catch(console.error).finally(()=>pool.end())
