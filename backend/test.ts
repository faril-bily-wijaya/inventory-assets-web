import { prisma } from './src/index.js'

async function test() {
  try {
    await prisma.users.create({
      data: {
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'asd',
        full_name: 'asd',
        role: 'STAFF'
      }
    })
    console.log('Success')
  } catch (e) {
    console.error('PRISMA ERROR:', e)
  } finally {
    process.exit(0)
  }
}
test()
