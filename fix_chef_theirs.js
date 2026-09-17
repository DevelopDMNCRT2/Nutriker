const fs = require('fs');
let c = fs.readFileSync('herramienta-nutricion/src/components/ChefView.jsx', 'utf8');

if (!c.includes('HeartPulse')) {
  c = c.replace('import { ShieldCheck, ChefHat', 'import { ShieldCheck, ChefHat, HeartPulse');
}

c = c.replace('export default function ChefView({ selectedWeek }) {', "export default function ChefView({ selectedWeek, serviceProfileKey = 'corporate' }) {");

c = c.replace(
  "label=\"Planificación de Cocina & Previsión de Producción:\"\n        />\n      </div>",
  `label="Planificación de Cocina & Previsión de Producción:"\n        />\n      </div>\n\n      {/* Senior Care Kitchen Alert Banner */}\n      {serviceProfileKey === 'senior_care' && (\n        <div style={{\n          display: 'flex',\n          alignItems: 'center',\n          gap: '0.65rem',\n          background: '#EFF6FF',\n          border: '1px solid #BFDBFE',\n          borderRadius: '12px',\n          padding: '0.65rem 1rem',\n          marginBottom: '1.25rem',\n          fontSize: '0.82rem',\n          color: '#1E40AF'\n        }}>\n          <HeartPulse size={20} color="#2563EB" style={{ flexShrink: 0 }} />\n          <div>\n            <strong>Estación de Cocina Geriátrica (Santa Sofía):</strong> Asegurar consistencia según ficha técnica IDDSI (Nivel 6 para Fácil Masticación, Nivel 4 para Puré sin grumos) y respetar la dosificación hiposódica estricta.\n          </div>\n        </div>\n      )}`
);

fs.writeFileSync('herramienta-nutricion/src/components/ChefView.jsx', c);
