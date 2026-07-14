const XLSX = require('./backend/node_modules/xlsx');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'source_data', 'Book1.xlsx');
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (rows.length > 0) {
    console.log("HEADERS IN BOOK1.XLSX:");
    console.log(JSON.stringify(rows[0], null, 2));
    
    if (rows.length > 1) {
        console.log("FIRST ROW DATA:");
        console.log(JSON.stringify(rows[1], null, 2));
    }
  } else {
    console.log("File is empty");
  }
} catch(e) {
  console.error("Error reading Book1.xlsx", e);
}
