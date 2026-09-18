const fs = require('fs');

const file1 = 'herramienta-nutricion/src/services/menuStore.js';
let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace(/'https:\/\/nutriker-server\.vercel\.app'/g, "'https://nutrikerserver.vercel.app'");
fs.writeFileSync(file1, c1);

console.log('Fixed url');
