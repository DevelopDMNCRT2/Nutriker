const fs = require('fs');
let c = fs.readFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', 'utf8');

c = c.replace(
`  const [dishSelection,
      humanVerification: {
        isVerified: true,
        verifiedBy: nutriologaInfo.name,
        role: nutriologaInfo.role,
        verifiedAt: new Date().toISOString(),
        certificationStatement: 'Menú auditado y certificado',
        notes: humanAuditNotes || 'Auditoría sin incidencias.'
      }, setDishSelection] = useState(INITIAL_DISH_SELECTION);`,
`  const [dishSelection, setDishSelection] = useState(INITIAL_DISH_SELECTION);`
);

fs.writeFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', c);
