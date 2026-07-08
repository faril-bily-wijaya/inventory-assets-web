const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('d:\\project Coding\\Inventory-assets-program\\genset-mobile\\Dummy Load & Genset Mobile.xlsx');
const sheetNames = workbook.SheetNames;

const result = {};
for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    result[sheetName] = data;
}

fs.writeFileSync('excel_data2.json', JSON.stringify(result, null, 2), 'utf-8');
