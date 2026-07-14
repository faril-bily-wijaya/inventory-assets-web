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
    // 1. Find the project directory
    // Typically it's in ~/inventory-assets-web, ~/inventory, /var/www/inventory, or similar
    console.log('--- Pulling and rebuilding ---');
    await runCmd('cd ~/map-inventory && git pull origin main && docker compose up -d --build');
    // Done
  } catch (err) {
    console.error('Error:', err);
  } finally {
    conn.end();
  }
}).connect({
  host: '124.156.204.209',
  port: 22,
  username: 'ubuntu',
  password: 'zpv-c6V-iYp-Vxw',
  readyTimeout: 20000
});
