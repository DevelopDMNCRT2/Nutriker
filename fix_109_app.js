const fs = require('fs');

let c = fs.readFileSync('herramienta-nutricion/src/App.jsx', 'utf8');

// Combine the state declarations
c = c.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> origin\/main\n/g, (match, head, main) => {
  // if it's the states at the top:
  if (head.includes('serviceProfileKey') && main.includes('isAdmin')) {
    return head + "\n" + main;
  }
  // if it's the Header props:
  if (head.includes('serviceProfileKey={serviceProfileKey}') && main.includes('isAdmin={isAdmin}')) {
    return `        isAdmin={isAdmin}\n        onLogout={handleLogout}\n        serviceProfileKey={serviceProfileKey}\n        onServiceProfileChange={handleServiceProfileChange}`;
  }
  // if it's the footer text:
  if (head.includes('Modelo Especializado') && main.includes('Plataforma Corporativa')) {
    return head + "\n" + main.replace('<div>', '').replace('</div>', '').trim() + "\n";
  }
  
  return head + "\n" + main;
});

// A small manual fix for the footer since it's tricky
c = c.replace(/<div>\s*<strong>Nutrición<\/strong> • \{serviceProfileKey === 'senior_care' \? 'Modelo Especializado: Residencia de Mayores \(Santa Sofía\)' : 'Plataforma Corporativa B2B \(Cliente: Retodali\)'\}\n\s*<\/div>\n\s*<div>\n\s*Acceso Directo de Presentación: 👤 \{serviceProfileKey === 'senior_care' \? 'Residente \/ Enfermería' : 'Empleado'\} • 👨‍🍳 Chef • 🥗 Nutrióloga\n\s*<\/div>\n\s*<strong>Nutrición<\/strong> • Plataforma Corporativa \(Royal Canin\)/, 
`<div>
            <strong>Nutrición</strong> • {serviceProfileKey === 'senior_care' ? 'Modelo Especializado: Residencia de Mayores (Santa Sofía)' : 'Plataforma Corporativa B2B (Cliente: Retodali)'}
          </div>
          <div>
            Acceso Directo de Presentación: 👤 {serviceProfileKey === 'senior_care' ? 'Residente / Enfermería' : 'Empleado'} • 👨‍🍳 Chef • 🥗 Nutrióloga
          </div>`);

fs.writeFileSync('herramienta-nutricion/src/App.jsx', c);
