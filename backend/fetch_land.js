const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const geojson = JSON.parse(data);
      // Available provinces we need:
      // JAMBI, SUMATERA SELATAN, LAMPUNG, BENGKULU, KEPULAUAN BANGKA BELITUNG
      const targets = [
        { prov: 'JAMBI', name: 'JAMBI' },
        { prov: 'SUMATERA SELATAN', name: 'PALEMBANG' },
        { prov: 'LAMPUNG', name: 'LAMPUNG' },
        { prov: 'BENGKULU', name: 'BENGKULU' },
        { prov: 'KEPULAUAN BANGKA BELITUNG', name: 'PANGKAL PINANG' },
        { prov: 'BANGKA BELITUNG', name: 'PANGKAL PINANG' }
      ];
      
      const newFeatures = [];
      
      for (const feature of geojson.features) {
        const provName = (feature.properties.Propinsi || feature.properties.name || feature.properties.NAME_1 || '').toUpperCase();
        console.log('Found province:', provName);
        const match = targets.find(t => provName.includes(t.prov));
        if (match) {
          feature.properties.name = match.name;
          newFeatures.push(feature);
          console.log('Matched:', match.name);
        }
      }
      
      const results = {
        type: 'FeatureCollection',
        features: newFeatures
      };
      
      fs.writeFileSync('../frontend/public/geojson/districts.json', JSON.stringify(results));
      console.log('Saved land boundaries to districts.json');
    } catch (e) {
      console.error(e);
    }
  });
});
