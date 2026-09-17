const fs = require('fs');
let c = fs.readFileSync('herramienta-nutricion/src/components/ChefView.jsx', 'utf8');
c = c.replace(
  "Pedidos Confirmados'} • Plantilla: {totalPortions} Empleados\n              </span>",
  "Pedidos Confirmados'} • Plantilla: {totalPortions} Empleados\n              </span>\n              {activeMenu?.humanVerification?.isVerified && (\n                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>\n                  <ShieldCheck size={14} color=\"#16A34A\" /> Fichas Certificadas por {activeMenu.humanVerification.verifiedBy}\n                </span>\n              )}"
);
if (!c.includes('ShieldCheck')) {
  c = c.replace('import { ChefHat', 'import { ShieldCheck, ChefHat');
}
fs.writeFileSync('herramienta-nutricion/src/components/ChefView.jsx', c);
