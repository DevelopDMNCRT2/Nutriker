const fs = require('fs');
let c = fs.readFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', 'utf8');

const regex = /const \[dishSelection,[\s\S]*?setDishSelection\] = useState\(\{\}\);/m;
c = c.replace(regex, 'const [dishSelection, setDishSelection] = useState({});');

fs.writeFileSync('herramienta-nutricion/src/components/NutriologaView.jsx', c);
