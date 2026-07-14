const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function check() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const locs = await prisma.locations.findMany({
    where: {
      name: {
        contains: 'bengkulu',
        mode: 'insensitive'
      }
    }
  });
  console.log("Bengkulu locations in DB:", locs.length);
  locs.forEach(l => console.log(l.name, "Lat:", l.latitude, "Lng:", l.longitude));

  const dists = await prisma.districts.findMany({
    where: {
      name: {
        contains: 'bengkulu',
        mode: 'insensitive'
      }
    }
  });
  console.log("Bengkulu districts in DB:");
  dists.forEach(d => console.log(d.name, d.id));

}
check().catch(console.error).finally(() => process.exit(0));
