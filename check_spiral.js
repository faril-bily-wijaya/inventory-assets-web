const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const locations = await prisma.locations.findMany({
      where: {
        latitude: -3.5,
        longitude: 103.5
      },
      include: {
        _count: {
          select: { devices: true }
        }
      }
    });

    console.log(`Found ${locations.length} locations at spiral (-3.5, 103.5).`);
    let totalDevices = 0;
    for (const loc of locations) {
      console.log(`- ${loc.name} (Devices: ${loc._count.devices})`);
      totalDevices += loc._count.devices;
    }
    console.log(`Total devices affected: ${totalDevices}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
