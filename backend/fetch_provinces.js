const https = require('https');
const fs = require('fs');

const mappings = [
  { name: 'BENGKULU', query: 'Bengkulu Province, Indonesia' },
  { name: 'JAMBI', query: 'Jambi Province, Indonesia' },
  { name: 'LAMPUNG', query: 'Lampung Province, Indonesia' },
  { name: 'PALEMBANG', query: 'Sumatera Selatan, Indonesia' },
  { name: 'PANGKAL PINANG', query: 'Kepulauan Bangka Belitung, Indonesia' }
];

const results = { type: 'FeatureCollection', features: [] };

async function fetchGeo(q) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&polygon_geojson=1&format=json`;
    console.log('Fetching', q);
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
      results.features.push({ type: 'Feature', properties: { name: m.name }, geometry: place.geojson });
      console.log('Success:', m.name);
    } else {
      console.log('Failed:', m.name);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(results));
  console.log('Done');
})();
