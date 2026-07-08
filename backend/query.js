const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Regionals:', await prisma.regionals.findMany());
  console.log('Districts:', await prisma.districts.findMany());
  console.log('Clusters:', await prisma.clusters.findMany());
}
main().catch(console.error).finally(()=>prisma.$disconnect());
