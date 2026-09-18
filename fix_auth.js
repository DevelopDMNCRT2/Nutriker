const fs = require('fs');
const path = 'server/controllers/authController.js';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  "WHERE (correo = $1 OR usuario = $1) AND deleted_at IS NULL",
  "WHERE (LOWER(correo) = LOWER($1) OR LOWER(usuario) = LOWER($1)) AND deleted_at IS NULL"
);

fs.writeFileSync(path, c);
