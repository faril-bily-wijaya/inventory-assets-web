const https = require('https');
const fs = require('fs');

const mappings = [
  { name: 'JAMBI', query: 'Jambi, Indonesia' },
  { name: 'LAMPUNG', query: 'Lampung, Indonesia' }
];

let existing = { features: [] };
try { existing = JSON.parse(fs.readFileSync('../frontend/public/geojson/districts.json')); } catch(e){}

async function fetchGeo(q) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&polygon_geojson=1&format=json`;
    https.get(url, { headers: { 'User-Agent': 'InventoryAssetsApp/1.0' } }, (res) => {
      let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

(async () => {
  for (let m of mappings) {
    const data = await fetchGeo(m.query);
    const place = Array.isArray(data) ? (data.find(p => p.class === 'boundary') || data[0]) : null;
    if (place && place.geojson) {
      existing.features.push({ type: 'Feature', properties: { name: m.name }, geometry: place.geojson });
      console.log('Success:', m.name);
    } else {
      console.log('Failed:', m.name);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(existing));
  console.log('Done');
})();
