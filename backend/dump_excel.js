const xlsx = require('xlsx');

const workbook = xlsx.readFile('d:\\project Coding\\Inventory-assets-program\\genset-mobile\\Dummy Load & Genset Mobile.xlsx');
const sheetNames = workbook.SheetNames;

const result = {};
for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    result[sheetName] = data;
}

console.log(JSON.stringify(result, null, 2));
