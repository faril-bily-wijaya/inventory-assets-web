import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const regionals = await prisma.regionals.findMany()
  const districts = await prisma.districts.findMany()
  const clusters = await prisma.clusters.findMany()
  console.log('Regionals:', regionals)
  console.log('Districts:', districts)
  console.log('Clusters:', clusters)
}
main().catch(console.error).finally(() => prisma.$disconnect())
