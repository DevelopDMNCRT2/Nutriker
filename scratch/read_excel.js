const xlsx = require('xlsx');

const files = [
  '../docs/HISTORIA CLINICA.xlsx',
  '../docs/HISTORIA CLINICA HOMBRE.xlsx',
  '../docs/HISTORIA CLINICA MUJER.xlsx'
];

files.forEach(file => {
  console.log('--- ' + file + ' ---');
  try {
    const workbook = xlsx.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Print all rows with data
    data.forEach((row, i) => {
      const rowContent = row.filter(cell => cell !== undefined && cell !== null && cell !== '').join(' | ');
      if (rowContent) {
        console.log(`[Row ${i + 1}] ${rowContent}`);
      }
    });
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
  console.log('\n');
});
