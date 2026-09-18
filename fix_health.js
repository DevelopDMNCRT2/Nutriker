const fs = require('fs');
let c = fs.readFileSync('server/index.js', 'utf8');
c = c.replace(
  "res.json({ status: 'ok', timestamp: new Date().toISOString() })",
  "res.json({ status: 'ok', timestamp: new Date().toISOString(), hasDb: !!process.env.DATABASE_URL, dbLen: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0 })"
);
fs.writeFileSync('server/index.js', c);
