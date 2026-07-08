const https = require('https');
const fs = require('fs');
const districts = ['Bengkulu', 'Jambi', 'Lampung', 'Palembang', 'Pangkal Pinang'];
const results = { type: 'FeatureCollection', features: [] };
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
  for (let d of districts) {
    if (existing.features.find(f => f.properties.name === d.toUpperCase())) {
      results.features.push(existing.features.find(f => f.properties.name === d.toUpperCase()));
      continue;
    }
    const queries = [d + ', Indonesia', 'Kota ' + d + ', Indonesia', d + ' City, Indonesia', d + ' Province, Indonesia'];
    let success = false;
    for (let q of queries) {
      console.log('Fetching', q);
      const data = await fetchGeo(q);
      const place = Array.isArray(data) ? (data.find(p => p.class === 'boundary') || data[0]) : null;
      if (place && place.geojson) {
        results.features.push({ type: 'Feature', properties: { name: d.toUpperCase() }, geometry: place.geojson });
        console.log('Success:', d);
        success = true;
        break;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    if (!success) console.log('Failed totally for', d);
  }
  fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(results));
  console.log('Done');
})();
