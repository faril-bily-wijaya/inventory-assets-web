const https = require('https');
const fs = require('fs');
const districts = ['Bengkulu', 'Jambi', 'Lampung', 'Palembang', 'Pangkal Pinang'];
const results = { type: 'FeatureCollection', features: [] };

async function fetchGeo(district) {
  return new Promise((resolve) => {
    // Specifically search for provinces/cities to ensure we get the right polygon
    const q = district === 'Lampung' || district === 'Bengkulu' || district === 'Jambi' 
      ? district + ' Province, Indonesia' 
      : district + ', Indonesia';
      
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&polygon_geojson=1&format=json`;
    console.log('Fetching', url);
    https.get(url, { headers: { 'User-Agent': 'InventoryAssetsApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

(async () => {
  for (let d of districts) {
    const data = await fetchGeo(d);
    // filter for boundary or administrative
    const place = data.find(p => p.class === 'boundary' || p.type === 'administrative') || data[0];
    if (place && place.geojson) {
      results.features.push({
        type: 'Feature',
        properties: { name: d.toUpperCase() },
        geometry: place.geojson
      });
      console.log('Success:', d);
    } else {
      console.log('Failed:', d);
    }
    await new Promise(r => setTimeout(r, 2000)); // Nominatim rate limit
  }
  fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(results));
  console.log('Saved to frontend/public/geojson/districts.json');
})();
