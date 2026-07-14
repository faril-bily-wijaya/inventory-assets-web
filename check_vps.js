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
  try {
    const script = `
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function check() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const defCluster = await prisma.clusters.findFirst({ where: { name: 'CLUSTER DEFAULT' } });
  if (!defCluster) {
    console.log('No CLUSTER DEFAULT');
  } else {
    const locs = await prisma.locations.findMany({ where: { cluster_id: defCluster.id } });
    console.log('Locations in CLUSTER DEFAULT:');
    locs.forEach(l => console.log('>> ' + l.name + ' - Lat: ' + l.latitude + ', Lng: ' + l.longitude));
  }
}
check().catch(console.error).finally(() => prisma['$disconnect']());
`;

    const cmd = `docker exec inventory-backend sh -c "cat > check_cluster.js << 'EOF'
${script}
EOF
node check_cluster.js"`;

    await runCmd(cmd);
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
