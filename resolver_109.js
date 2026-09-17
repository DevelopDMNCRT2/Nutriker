const fs = require('fs');

function resolveApp() {
  let c = fs.readFileSync('herramienta-nutricion/src/App.jsx', 'utf8');
  c = c.replace(/<<<<<<< HEAD[\s\S]*?=======\n/, '');
  c = c.replace(/>>>>>>> origin\/main\n/, '');
  fs.writeFileSync('herramienta-nutricion/src/App.jsx', c);
}

function resolveHeader() {
  let c = fs.readFileSync('herramienta-nutricion/src/components/Header.jsx', 'utf8');
  c = c.replace(/<<<<<<< HEAD[\s\S]*?=======\n/, '');
  c = c.replace(/>>>>>>> origin\/main\n/, '');
  fs.writeFileSync('herramienta-nutricion/src/components/Header.jsx', c);
}

function resolveChef() {
  let c = fs.readFileSync('herramienta-nutricion/src/components/ChefView.jsx', 'utf8');
  c = c.replace(/<<<<<<< HEAD[\s\S]*?=======\n/, '');
  c = c.replace(/>>>>>>> origin\/main\n/, '');
  fs.writeFileSync('herramienta-nutricion/src/components/ChefView.jsx', c);
}

resolveApp();
resolveHeader();
resolveChef();
