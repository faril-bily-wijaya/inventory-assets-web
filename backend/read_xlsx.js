const XLSX = require('xlsx');

const filePath = 'd:\\project Coding\\Inventory-assets-program\\genset-mobile\\Dummy Load & Genset Mobile.xlsx';
const workbook = XLSX.readFile(filePath);

console.log("=== Sheets in file ===");
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    console.log(`\n=== Data in Sheet: ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Total Rows: ${data.length}`);
    console.log("First 3 Rows:", JSON.stringify(data.slice(0, 3), null, 2));
    
    if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    }
});
