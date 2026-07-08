import { prisma } from './src/index.js'

async function test() {
  try {
    const res = await prisma.$queryRaw`SELECT pg_get_constraintdef(c.oid) AS constraint_def FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'users' AND c.conname = 'users_role_check'`
    console.log(res)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}
test()
