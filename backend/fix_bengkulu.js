const https = require('https');
const fs = require('fs');

const url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent('Bengkulu, Indonesia') + '&polygon_geojson=1&format=json';

https.get(url, { headers: { 'User-Agent': 'InventoryAssetsApp/1.0' } }, (res) => {
  let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => {
    const json = JSON.parse(data);
    const boundary = json.find(p => p.class === 'boundary');
    
    if (boundary && boundary.geojson) {
      const districts = JSON.parse(fs.readFileSync('../frontend/public/geojson/districts.json'));
      
      // Remove old Bengkulu
      const filteredFeatures = districts.features.filter(f => f.properties.name !== 'BENGKULU');
      
      // Push new polygon
      filteredFeatures.push({
        type: 'Feature',
        properties: { name: 'BENGKULU' },
        geometry: boundary.geojson
      });
      
      districts.features = filteredFeatures;
      
      fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(districts));
      console.log('Successfully updated Bengkulu geometry with Polygon.');
    } else {
      console.log('Failed to find boundary.');
    }
  });
});
