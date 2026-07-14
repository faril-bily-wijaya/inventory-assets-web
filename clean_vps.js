const { Client } = require('ssh2');

const conn = new Client();

const runCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('close', (code, signal) => {
        resolve({ code, out });
      }).on('data', (data) => {
        out += data;
        process.stdout.write(data);
      }).stderr.on('data', (data) => {
        out += data;
        process.stderr.write(data);
      });
    });
  });
};

conn.on('ready', async () => {
  console.log('Client :: ready');
  try {
    const script = `
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function clean() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const locations = await prisma.locations.findMany({
    select: { name: true, latitude: true, longitude: true, _count: { select: { devices: true } } }
  });
  console.log('Total locations: ' + locations.length);
  const gensetLocs = locations.filter(l => l.latitude === -3.5 && l.longitude === 103.5);
  console.log('Locations at -3.5, 103.5: ' + gensetLocs.length);
  gensetLocs.forEach(l => console.log(l.name));
  
  if (gensetLocs.length === 0) {
    console.log('No spiral locations found.');
    return;
  }
  
  console.log('Found ' + gensetLocs.length + ' locations at -3.5, 103.5');
  let devicesCount = 0;
  for (const loc of gensetLocs) {
    devicesCount += loc._count.devices;
    console.log(' - ' + loc.name + ' (' + loc._count.devices + ' devices)');
  }
  
  console.log('Total devices affected: ' + devicesCount);
  console.log('Deleting...');
  
  const result = await prisma.locations.deleteMany({
    where: { latitude: -3.5, longitude: 103.5 }
  });
  
  console.log('Deleted ' + result.count + ' locations.');
  await prisma['$disconnect']();
}
clean().catch(console.error);
`;

    // Write script to container and run it
    const cmd = `docker exec inventory-backend sh -c "cat > clean.js << 'EOF'
${script}
EOF
node clean.js"`;

    console.log('Running clean script on VPS...');
    await runCmd(cmd);
    
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
  conn.end();
}).connect({
  host: '124.156.204.209',
  port: 22,
  username: 'ubuntu',
  password: 'zpv-c6V-iYp-Vxw',
  readyTimeout: 99999
});
