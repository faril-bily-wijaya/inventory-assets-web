const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const regionals = await prisma.regionals.findMany();
  const districts = await prisma.districts.findMany();
  const clusters = await prisma.clusters.findMany();
  fs.writeFileSync('db_dump.txt', JSON.stringify({regionals, districts, clusters}, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
