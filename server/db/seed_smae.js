/**
 * Seed del Catálogo SMAE 2024/2026
 * Sistema Mexicano de Alimentos Equivalentes
 * Grupos de equivalentes y alimentos comunes en México
 */
import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ── GRUPOS DE EQUIVALENTES SMAE 2024/2026 ──────────────────────────────────
// (clave, nombre, descripcion, kcal, proteina_g, lipidos_g, hco_g, color_hex)
const GRUPOS = [
  ['verduras',       'Verduras',                          '½ taza cocida ó 1 taza cruda',                  25,   2.0, 0.0,  4.0, '#22c55e'],
  ['frutas',         'Frutas',                            '1 porción según el alimento',                   60,   0.0, 0.0, 15.0, '#f97316'],
  ['cereales_sg',    'Cereales sin grasa',                '1 porción (varía por alimento)',                 70,   2.0, 0.0, 15.0, '#eab308'],
  ['cereales_cg',    'Cereales con grasa',                '1 porción con adición de grasa',               115,   2.0, 5.0, 15.0, '#ca8a04'],
  ['leguminosas',    'Leguminosas',                       '½ taza cocida',                                120,   8.0, 1.0, 20.0, '#a16207'],
  ['aoa_mba',        'AOA Muy Bajo Aporte de Grasa',      '30 g (tamaño de una palma)',                    40,   7.0, 1.0,  0.0, '#06b6d4'],
  ['aoa_ba',         'AOA Bajo Aporte de Grasa',          '30 g (tamaño de una palma)',                    55,   7.0, 3.0,  0.0, '#0891b2'],
  ['aoa_mod',        'AOA Moderado Aporte de Grasa',      '30 g (tamaño de una palma)',                    75,   7.0, 5.0,  0.0, '#0e7490'],
  ['aoa_alto',       'AOA Alto Aporte de Grasa',          '30 g (tamaño de una palma)',                   100,   7.0, 8.0,  0.0, '#155e75'],
  ['leche_desc',     'Leche Descremada',                  '240 ml (1 taza)',                               95,   9.0, 2.0, 12.0, '#818cf8'],
  ['leche_semi',     'Leche Semidescremada',              '240 ml (1 taza)',                              110,   9.0, 4.0, 12.0, '#6366f1'],
  ['leche_entera',   'Leche Entera',                      '240 ml (1 taza)',                              150,   9.0, 8.0, 12.0, '#4f46e5'],
  ['aceites_sp',     'Aceites y Grasas sin Proteína',     '1 cdita (5 ml) ó la porción indicada',          45,   0.0, 5.0,  0.0, '#f59e0b'],
  ['aceites_cp',     'Aceites y Grasas con Proteína',     '1 porción según alimento',                      70,   3.0, 6.0,  0.0, '#d97706'],
  ['azucares_sg',    'Azúcares sin Grasa',                '1 porción (varía)',                              40,   0.0, 0.0, 10.0, '#ec4899'],
  ['azucares_cg',    'Azúcares con Grasa',                '1 porción con grasa añadida',                   85,   0.0, 5.0, 10.0, '#db2777'],
]

// ── ALIMENTOS POR GRUPO ────────────────────────────────────────────────────
// (nombre, cantidad_medida, peso_neto_g, kcal, proteina_g, lipidos_g, hco_g, fibra_g, sodio_mg)
const ALIMENTOS = {
  verduras: [
    ['Acelgas', '½ taza cocida', 90, 18, 1.8, 0.0, 3.6, 1.6, 156],
    ['Ajo', '5 dientes', 15, 20, 0.9, 0.0, 4.5, 0.3, 2],
    ['Alcachofa', '½ taza cocida', 84, 45, 2.4, 0.2, 8.9, 4.0, 55],
    ['Apio', '½ taza picado', 60, 8, 0.4, 0.1, 1.5, 0.8, 52],
    ['Berenjena', '½ taza cocida', 50, 13, 0.4, 0.1, 3.2, 1.2, 1],
    ['Betabel / Remolacha', '½ taza cocida', 85, 37, 1.4, 0.1, 8.5, 1.7, 65],
    ['Brócoli', '½ taza cocida', 78, 27, 1.9, 0.3, 5.6, 2.6, 32],
    ['Calabacita', '½ taza cocida', 90, 18, 1.3, 0.2, 3.5, 1.3, 5],
    ['Cebolla', '½ taza picada cruda', 80, 32, 0.9, 0.1, 7.5, 1.4, 3],
    ['Champiñones', '½ taza rebanados crudos', 35, 8, 1.1, 0.1, 1.1, 0.4, 2],
    ['Chile poblano', '1 pieza grande', 70, 18, 0.8, 0.2, 3.7, 1.5, 3],
    ['Chile serrano', '3 piezas', 15, 5, 0.3, 0.1, 1.0, 0.5, 2],
    ['Col / Repollo', '½ taza cocida', 75, 17, 0.9, 0.1, 3.3, 1.5, 6],
    ['Col morada', '½ taza cruda rallada', 35, 11, 0.5, 0.0, 2.5, 0.8, 10],
    ['Coliflor', '½ taza cocida', 62, 14, 1.1, 0.3, 2.5, 1.4, 9],
    ['Ejotes', '½ taza cocidos', 65, 22, 1.2, 0.2, 4.9, 2.0, 2],
    ['Espárragos', '½ taza cocidos', 90, 20, 2.2, 0.2, 3.7, 1.8, 10],
    ['Espinacas', '1 taza cruda', 30, 7, 0.9, 0.1, 1.1, 0.7, 24],
    ['Flor de calabaza', '½ taza cocida', 60, 10, 0.7, 0.1, 2.1, 0.5, 2],
    ['Germinado de soya', '½ taza crudo', 52, 13, 1.3, 0.7, 1.2, 0.5, 6],
    ['Jitomate', '1 pieza mediana', 123, 22, 1.1, 0.2, 4.8, 1.5, 6],
    ['Jícama', '½ taza cruda', 65, 25, 0.5, 0.1, 5.9, 3.0, 3],
    ['Lechuga orejona', '1 taza cruda picada', 55, 8, 0.7, 0.1, 1.3, 0.7, 5],
    ['Nopal', '½ taza cocido en rajas', 75, 11, 0.8, 0.1, 2.3, 1.9, 21],
    ['Papa / Patata', '½ taza cocida en cubos', 75, 67, 1.6, 0.1, 15.6, 1.4, 3],
    ['Pepino', '1 taza rebanado crudo', 119, 16, 0.7, 0.1, 3.8, 0.5, 2],
    ['Pimiento morrón rojo', '½ taza crudo', 75, 23, 0.8, 0.2, 4.7, 1.5, 2],
    ['Pimiento morrón verde', '½ taza crudo', 75, 15, 0.6, 0.1, 3.5, 1.3, 2],
    ['Tomate verde', '½ taza crudo', 66, 21, 0.6, 0.7, 3.9, 1.3, 1],
    ['Zanahoria', '½ taza cocida en rodajas', 78, 27, 0.6, 0.1, 6.4, 2.3, 45],
    ['Chayote', '½ taza cocido', 80, 19, 0.5, 0.1, 4.5, 1.7, 2],
    ['Verdolagas', '½ taza cocida', 58, 12, 1.1, 0.2, 2.1, 0.8, 51],
    ['Quelites / Huauzontle', '½ taza cocido', 75, 18, 1.5, 0.3, 3.0, 1.2, 10],
  ],

  frutas: [
    ['Ciruela pasa', '3 piezas', 25, 60, 0.6, 0.1, 15.9, 1.8, 1],
    ['Durazno', '1 pieza mediana', 98, 37, 0.9, 0.3, 9.5, 1.5, 0],
    ['Fresa', '1 taza entera', 152, 49, 1.0, 0.5, 11.7, 3.0, 1],
    ['Guayaba', '1 pieza', 90, 55, 2.1, 0.5, 11.9, 5.4, 3],
    ['Kiwi', '1 pieza grande', 91, 56, 1.1, 0.5, 13.5, 2.7, 5],
    ['Lima', '1 pieza mediana', 101, 30, 0.7, 0.2, 10.5, 2.8, 2],
    ['Limón', '3 piezas grandes', 95, 17, 0.6, 0.2, 5.4, 1.6, 1],
    ['Mamey', '1 rebanada', 170, 114, 1.4, 0.4, 28.0, 5.4, 7],
    ['Mandarina', '1 pieza grande', 116, 65, 0.9, 0.4, 16.3, 2.6, 2],
    ['Mango', '½ pieza mediana ó 1 taza', 120, 99, 1.4, 0.6, 24.7, 2.6, 2],
    ['Manzana', '1 pieza pequeña con cáscara', 138, 72, 0.4, 0.2, 19.1, 3.3, 1],
    ['Melón cantaloupe', '1 taza cubos', 160, 54, 1.3, 0.3, 12.7, 1.4, 26],
    ['Naranja', '1 pieza mediana', 130, 62, 1.2, 0.2, 15.4, 3.1, 0],
    ['Papaya', '1 taza cubos', 145, 55, 0.9, 0.2, 13.7, 2.5, 8],
    ['Pera', '1 pieza pequeña con cáscara', 148, 86, 0.5, 0.2, 23.0, 4.6, 1],
    ['Piña', '¾ taza cubos', 123, 62, 0.7, 0.1, 16.2, 1.7, 1],
    ['Plátano tabasco / dominico', '1 pieza', 60, 53, 0.6, 0.2, 14.0, 1.5, 1],
    ['Sandía', '2 tazas cubos', 280, 85, 1.7, 0.4, 21.3, 1.1, 3],
    ['Toronja', '1 pieza mediana', 246, 74, 1.5, 0.2, 18.6, 2.5, 0],
    ['Tuna roja/verde', '2 piezas medianas', 148, 60, 0.7, 0.0, 14.3, 3.7, 5],
    ['Uvas', '¾ taza', 92, 62, 0.6, 0.3, 15.8, 0.8, 2],
    ['Zapote negro', '¼ pieza', 110, 50, 0.6, 0.2, 13.5, 3.8, 3],
    ['Chicozapote', '1 pieza chica', 60, 50, 0.4, 0.6, 13.2, 1.5, 8],
    ['Ciruela mexicana', '4 piezas', 60, 45, 0.5, 0.1, 11.7, 1.4, 0],
    ['Higo fresco', '2 piezas', 90, 63, 0.6, 0.2, 16.3, 2.4, 1],
    ['Tejocote', '3 piezas', 90, 45, 0.5, 0.1, 11.4, 3.6, 2],
    ['Granada roja', '½ pieza', 87, 52, 0.7, 0.3, 13.2, 1.1, 2],
    ['Tamarindo sin cáscara', '30 g', 30, 72, 0.7, 0.2, 18.5, 1.5, 6],
  ],

  cereales_sg: [
    ['Arroz blanco cocido', '⅓ taza', 65, 68, 1.4, 0.1, 14.8, 0.1, 1],
    ['Arroz integral cocido', '⅓ taza', 65, 72, 1.5, 0.3, 15.0, 0.7, 1],
    ['Avena en hojuelas', '¼ taza cruda', 25, 94, 4.0, 1.7, 16.3, 2.7, 1],
    ['Elote desgranado cocido', '½ taza', 82, 66, 2.5, 0.9, 15.6, 2.0, 1],
    ['Espagueti / Pasta cocida', '½ taza', 70, 88, 3.2, 0.5, 17.2, 0.9, 1],
    ['Harina de maíz nixtamalizada', '30 g', 30, 102, 2.7, 1.1, 21.5, 3.2, 11],
    ['Tortilla de maíz', '1 pieza (30 g)', 30, 66, 1.7, 0.8, 13.9, 1.3, 15],
    ['Pan integral', '1 rebanada (30 g)', 30, 69, 3.6, 1.1, 12.9, 1.9, 132],
    ['Pan blanco', '1 rebanada (25 g)', 25, 66, 2.2, 0.9, 12.6, 0.5, 128],
    ['Galleta Marías', '5 galletas', 30, 126, 1.7, 2.9, 22.6, 0.3, 100],
    ['Cereal de caja (sin azúcar)', '¾ taza', 30, 110, 3.0, 1.0, 23.0, 3.0, 150],
    ['Tostadas de maíz', '1 pieza', 19, 73, 1.5, 0.6, 15.4, 1.1, 60],
    ['Quinoa cocida', '⅓ taza', 65, 79, 2.9, 1.3, 14.4, 1.3, 6],
    ['Camote cocido sin piel', '½ taza en cubos', 80, 72, 1.3, 0.1, 16.8, 2.5, 27],
    ['Bolillo sin migajón', '½ pieza (30 g)', 30, 82, 2.8, 1.0, 16.0, 0.5, 140],
    ['Fécula de maíz / Maicena', '2 cdas', 16, 55, 0.0, 0.1, 13.5, 0.1, 2],
    ['Cebada perlada cocida', '⅓ taza', 65, 64, 1.9, 0.4, 14.3, 1.8, 2],
    ['Pan árabe', '½ pieza (30 g)', 30, 82, 2.8, 0.4, 16.5, 0.6, 152],
    ['Amaranto (palomitas)', '¼ taza', 15, 55, 2.1, 0.9, 10.5, 1.5, 1],
    ['Tortilla de trigo mediana', '1 pieza (30 g)', 30, 90, 2.5, 2.0, 15.0, 0.8, 170],
  ],

  cereales_cg: [
    ['Croissant', '1 pequeño (28 g)', 28, 114, 2.4, 6.0, 13.0, 0.5, 197],
    ['Donut / Dona', '1 pequeña (42 g)', 42, 159, 1.9, 8.7, 19.7, 0.6, 145],
    ['Granola con frutos secos', '¼ taza', 28, 132, 3.5, 6.5, 16.5, 1.7, 45],
    ['Hot cake o crepas', '1 pieza mediana', 38, 106, 2.8, 4.2, 14.7, 0.4, 202],
    ['Muffin inglés', '½ pieza', 28, 67, 2.5, 0.5, 13.0, 0.7, 134],
    ['Pan de caja con mantequilla', '1 rebanada + 1 cdita grasa', 32, 113, 2.4, 5.0, 14.9, 0.5, 195],
    ['Waffle de avena', '1 pieza pequeña (35 g)', 35, 100, 3.0, 3.5, 14.5, 1.2, 196],
    ['Taco dorado', '1 pieza (30 g tortilla + fritura)', 45, 115, 2.1, 5.0, 15.5, 1.0, 110],
    ['Tamales (sin relleno)', '1 pieza mediana (75 g)', 75, 145, 2.9, 6.0, 19.7, 1.5, 198],
  ],

  leguminosas: [
    ['Frijoles negros cocidos', '½ taza', 86, 114, 7.6, 0.5, 20.4, 7.5, 1],
    ['Frijoles pintos cocidos', '½ taza', 86, 122, 8.0, 0.5, 22.5, 7.7, 2],
    ['Frijoles bayos cocidos', '½ taza', 86, 115, 7.5, 0.4, 21.5, 7.3, 1],
    ['Lentejas cocidas', '½ taza', 99, 115, 9.0, 0.4, 19.9, 7.8, 2],
    ['Garbanzos cocidos', '½ taza', 82, 135, 7.3, 2.1, 22.5, 6.2, 6],
    ['Habas secas cocidas', '½ taza', 85, 94, 6.5, 0.3, 16.7, 4.6, 4],
    ['Soya cocida', '¼ taza', 86, 149, 14.3, 7.7, 8.5, 5.2, 1],
    ['Edamame (soya verde)', '½ taza desgranada', 78, 95, 8.5, 4.0, 7.5, 4.0, 5],
    ['Alubia / Judía blanca cocida', '½ taza', 90, 127, 8.7, 0.3, 22.8, 6.3, 1],
    ['Alverjón / Chícharo seco cocido', '½ taza', 98, 116, 8.2, 0.4, 20.8, 8.1, 2],
    ['Frijol de soya texturizado hidratado', '½ taza', 80, 80, 11.0, 0.5, 7.0, 3.5, 2],
  ],

  aoa_mba: [
    ['Clara de huevo cocida', '3 piezas grandes', 99, 52, 10.9, 0.2, 0.7, 0.0, 165],
    ['Atún en agua escurrido', '60 g', 60, 66, 14.5, 0.5, 0.0, 0.0, 196],
    ['Pechuga de pollo cocida sin piel', '30 g', 30, 49, 9.4, 0.8, 0.0, 0.0, 24],
    ['Tilapia al vapor', '30 g', 30, 36, 7.5, 0.6, 0.0, 0.0, 12],
    ['Filete de pez espada / Marlín ahumado', '30 g', 30, 44, 7.5, 1.0, 0.0, 0.0, 55],
    ['Robalo cocido', '30 g', 30, 39, 7.6, 0.7, 0.0, 0.0, 25],
    ['Sardinas en agua escurridas', '30 g', 30, 45, 7.5, 1.5, 0.0, 0.0, 180],
    ['Camarón cocido', '30 g', 30, 30, 6.4, 0.4, 0.0, 0.0, 111],
    ['Queso cottage bajo en grasa', '60 g', 60, 40, 6.9, 0.6, 1.5, 0.0, 184],
    ['Pavo molido cocido (pechuga)', '30 g', 30, 45, 8.5, 1.0, 0.0, 0.0, 28],
    ['Bacalao (sin sal) cocido', '30 g', 30, 39, 8.5, 0.3, 0.0, 0.0, 17],
    ['Pulpo cocido', '30 g', 30, 26, 4.7, 0.3, 0.7, 0.0, 66],
  ],

  aoa_ba: [
    ['Huevo entero cocido', '1 pieza grande', 50, 78, 6.3, 5.3, 0.6, 0.0, 62],
    ['Queso panela', '30 g', 30, 71, 5.5, 4.5, 1.0, 0.0, 185],
    ['Queso Oaxaca', '30 g', 30, 84, 6.2, 6.0, 0.5, 0.0, 160],
    ['Jamón de pavo (bajo en grasa)', '45 g', 45, 47, 7.0, 1.5, 1.5, 0.0, 558],
    ['Pechuga de pollo a la plancha', '30 g', 30, 55, 9.0, 1.5, 0.0, 0.0, 24],
    ['Filete de res cocido (magro)', '30 g', 30, 55, 7.5, 2.5, 0.0, 0.0, 19],
    ['Conejo cocido', '30 g', 30, 54, 7.8, 2.2, 0.0, 0.0, 15],
    ['Salmón ahumado', '30 g', 30, 52, 8.1, 2.0, 0.0, 0.0, 567],
    ['Trucha cocida', '30 g', 30, 54, 7.8, 2.4, 0.0, 0.0, 12],
    ['Queso requesón', '60 g', 60, 62, 6.8, 2.4, 2.5, 0.0, 73],
    ['Pez espada cocido', '30 g', 30, 55, 7.4, 2.5, 0.0, 0.0, 24],
    ['Surimi (palitos de cangrejo)', '45 g', 45, 54, 6.8, 0.5, 5.5, 0.0, 390],
    ['Jamón de pierna bajo en grasa', '45 g', 45, 52, 7.5, 1.8, 1.0, 0.0, 462],
    ['Mojarra cocida', '30 g', 30, 45, 7.0, 1.5, 0.5, 0.0, 18],
  ],

  aoa_mod: [
    ['Carne de res cocida (corte mediano)', '30 g', 30, 79, 7.0, 5.0, 0.0, 0.0, 22],
    ['Costilla de cerdo cocida', '30 g', 30, 75, 6.8, 5.0, 0.0, 0.0, 18],
    ['Pierna de pollo con piel cocida', '30 g', 30, 76, 6.9, 5.0, 0.0, 0.0, 26],
    ['Queso manchego', '30 g', 30, 104, 6.7, 7.5, 0.8, 0.0, 172],
    ['Queso chihuahua', '30 g', 30, 110, 6.5, 8.5, 0.4, 0.0, 174],
    ['Atún en aceite escurrido', '30 g', 30, 65, 7.5, 4.0, 0.0, 0.0, 100],
    ['Salmón cocido al vapor', '30 g', 30, 66, 7.2, 4.0, 0.0, 0.0, 22],
    ['Sardinas en aceite escurridas', '30 g', 30, 75, 7.5, 5.0, 0.0, 0.0, 210],
    ['Camarón con mantequilla', '30 g', 30, 72, 6.5, 4.5, 0.5, 0.0, 115],
    ['Lomo de cerdo cocido', '30 g', 30, 72, 7.2, 4.5, 0.0, 0.0, 17],
    ['Ricotta', '60 g', 60, 86, 7.0, 5.0, 3.0, 0.0, 77],
    ['Queso fresco', '40 g', 40, 75, 5.5, 5.5, 0.5, 0.0, 280],
    ['Salmón enlatado en agua', '30 g', 30, 65, 7.5, 3.5, 0.0, 0.0, 200],
  ],

  aoa_alto: [
    ['Carne molida (80/20) cocida', '30 g', 30, 100, 7.0, 8.0, 0.0, 0.0, 24],
    ['Chorizo cocido', '30 g', 30, 131, 5.7, 11.5, 0.6, 0.0, 358],
    ['Costilla de res cocida', '30 g', 30, 97, 7.2, 7.5, 0.0, 0.0, 23],
    ['Pato cocido', '30 g', 30, 95, 6.5, 7.5, 0.0, 0.0, 26],
    ['Queso amarillo / amarillento', '30 g', 30, 113, 7.0, 9.0, 0.3, 0.0, 400],
    ['Salchicha de res', '45 g', 45, 136, 5.0, 12.5, 1.0, 0.0, 504],
    ['Mortadela', '45 g', 45, 135, 5.8, 11.5, 1.5, 0.0, 442],
    ['Queso crema', '30 g', 30, 99, 2.2, 9.8, 0.8, 0.0, 89],
    ['Carnitas cocidas', '30 g', 30, 103, 7.2, 8.2, 0.0, 0.0, 25],
    ['Chicharrón de cerdo', '15 g', 15, 84, 7.7, 5.5, 0.5, 0.0, 320],
  ],

  leche_desc: [
    ['Leche descremada líquida', '240 ml', 240, 83, 8.2, 0.2, 12.1, 0.0, 103],
    ['Leche descremada en polvo', '4 cdas (25 g)', 25, 88, 8.5, 0.2, 12.5, 0.0, 130],
    ['Yogur natural descremado', '150 g', 150, 88, 8.5, 0.3, 11.5, 0.0, 120],
    ['Kéfir descremado', '240 ml', 240, 86, 8.0, 0.5, 12.0, 0.0, 95],
    ['Leche de soya sin azúcar', '240 ml', 240, 80, 7.0, 2.0, 9.0, 0.5, 90],
    ['Jocoque seco descremado', '80 g', 80, 75, 8.0, 0.5, 9.0, 0.0, 210],
  ],

  leche_semi: [
    ['Leche semidescremada (1-2%)', '240 ml', 240, 102, 8.2, 2.4, 12.2, 0.0, 107],
    ['Yogur de sabores bajo en grasa', '150 g', 150, 120, 7.5, 2.5, 17.0, 0.0, 100],
    ['Leche evaporada semidescremada', '120 ml', 120, 110, 8.5, 3.5, 12.0, 0.0, 130],
    ['Yogur griego bajo en grasa', '100 g', 100, 97, 10.0, 2.0, 8.0, 0.0, 56],
  ],

  leche_entera: [
    ['Leche entera líquida', '240 ml', 240, 149, 7.9, 8.0, 11.7, 0.0, 105],
    ['Yogur natural entero', '150 g', 150, 138, 7.9, 7.4, 10.6, 0.0, 104],
    ['Leche de coco (enlatada)', '120 ml', 120, 223, 2.3, 23.8, 3.4, 0.0, 15],
    ['Leche condensada', '2 cdas (30 g)', 30, 98, 2.4, 2.6, 16.7, 0.0, 36],
  ],

  aceites_sp: [
    ['Aceite de oliva', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aceite de canola', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aceite de girasol', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aceite de coco', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aceite de maíz', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aceite de aguacate', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Mantequilla sin sal', '1 cdita (5 g)', 5, 36, 0.0, 4.1, 0.0, 0.0, 1],
    ['Margarina vegetal', '1 cdita (5 g)', 5, 36, 0.0, 4.0, 0.0, 0.0, 45],
    ['Mayonesa light', '1 cda (10 g)', 10, 37, 0.1, 3.5, 1.5, 0.0, 110],
    ['Aceite de ajonjolí', '1 cdita (5 ml)', 5, 40, 0.0, 4.5, 0.0, 0.0, 0],
    ['Aderezo César light', '1 cda (15 g)', 15, 40, 0.2, 3.8, 1.0, 0.0, 170],
    ['Crema ácida', '2 cdas (30 g)', 30, 57, 0.6, 5.5, 1.6, 0.0, 14],
  ],

  aceites_cp: [
    ['Aguacate', '⅛ de aguacate mediano (30 g)', 30, 48, 0.6, 4.4, 2.6, 2.0, 3],
    ['Almendras', '10 piezas (14 g)', 14, 82, 3.0, 7.0, 2.8, 1.5, 0],
    ['Cacahuates tostados sin sal', '15 piezas (15 g)', 15, 87, 3.9, 7.1, 2.9, 1.2, 2],
    ['Nuez de Castilla', '4 mitades (14 g)', 14, 93, 2.2, 9.2, 1.9, 0.9, 1],
    ['Ajonjolí', '1 cda (8 g)', 8, 48, 1.5, 4.2, 1.5, 0.7, 1],
    ['Linaza molida', '1 cda (8 g)', 8, 42, 1.4, 3.3, 2.3, 2.2, 3],
    ['Semillas de girasol', '1 cda (8 g)', 8, 46, 1.5, 4.0, 1.5, 0.8, 0],
    ['Tahini / Pasta de ajonjolí', '1 cdita (5 g)', 5, 30, 0.9, 2.5, 1.2, 0.5, 4],
    ['Pistaches', '15 piezas (14 g)', 14, 79, 3.0, 6.3, 4.0, 1.5, 0],
    ['Nuez de la India / Cashew', '10 piezas (14 g)', 14, 79, 2.3, 6.3, 4.4, 0.4, 2],
    ['Mantequilla de cacahuate natural', '1 cdita (9 g)', 9, 57, 2.4, 4.8, 2.0, 0.6, 2],
  ],

  azucares_sg: [
    ['Azúcar blanca', '2 cditas (8 g)', 8, 31, 0.0, 0.0, 8.0, 0.0, 0],
    ['Azúcar mascabado', '2 cditas (8 g)', 8, 30, 0.0, 0.0, 7.8, 0.0, 1],
    ['Piloncillo', '1 cuadrito (10 g)', 10, 38, 0.0, 0.0, 9.8, 0.0, 1],
    ['Miel de abeja', '1 cdita (7 g)', 7, 21, 0.0, 0.0, 5.8, 0.0, 0],
    ['Mermelada de fresa light', '1 cda (20 g)', 20, 18, 0.1, 0.0, 4.5, 0.2, 8],
    ['Ate / Pasta de guayaba', '20 g', 20, 55, 0.1, 0.1, 14.0, 0.8, 3],
    ['Jarabe de agave', '1 cdita (7 g)', 7, 21, 0.0, 0.0, 5.6, 0.0, 1],
    ['Chocolate amargo 70%+ (porción)', '10 g', 10, 55, 1.2, 3.5, 5.0, 1.5, 1],
    ['Paleta de hielo (sin crema)', '1 pieza (60 ml)', 60, 40, 0.0, 0.0, 10.0, 0.0, 3],
  ],

  azucares_cg: [
    ['Chocolate de leche', '20 g', 20, 104, 1.5, 5.8, 11.8, 0.5, 30],
    ['Galleta de chocolate (sándwich)', '2 piezas (21 g)', 21, 95, 1.0, 4.0, 14.0, 0.3, 85],
    ['Helado de crema (sabor vainilla)', '½ taza (66 g)', 66, 137, 2.3, 7.2, 16.0, 0.5, 56],
    ['Barrita de avena y miel', '1 pieza (35 g)', 35, 136, 2.5, 4.5, 21.5, 1.8, 85],
    ['Cocada', '1 pieza (35 g)', 35, 130, 1.2, 6.0, 18.5, 1.0, 20],
    ['Cajeta (1 cda)', '15 g', 15, 56, 1.2, 1.2, 10.5, 0.0, 40],
    ['Nieve de agua con fruta', '1 bola (80 g)', 80, 86, 0.5, 0.0, 22.0, 0.5, 5],
  ],
}

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Limpiar datos previos si existen
    await client.query('DELETE FROM alimentos_smae')
    await client.query('DELETE FROM grupos_equivalentes')

    // Insertar grupos
    console.log('⏳ Insertando grupos de equivalentes SMAE...')
    const grupoIds = {}
    for (const [clave, nombre, desc, kcal, prot, lip, hco, color] of GRUPOS) {
      const { rows } = await client.query(
        `INSERT INTO grupos_equivalentes (clave, nombre, descripcion, kcal, proteina_g, lipidos_g, hco_g, color_hex)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [clave, nombre, desc, kcal, prot, lip, hco, color]
      )
      grupoIds[clave] = rows[0].id
    }
    console.log(`✅ ${GRUPOS.length} grupos insertados.`)

    // Insertar alimentos
    let totalAlimentos = 0
    for (const [grupoClave, alimentos] of Object.entries(ALIMENTOS)) {
      const grupoId = grupoIds[grupoClave]
      if (!grupoId) continue
      for (const [nombre, medida, peso, kcal, prot, lip, hco, fibra, sodio] of alimentos) {
        await client.query(
          `INSERT INTO alimentos_smae (grupo_id, nombre, cantidad_medida, peso_neto_g, kcal, proteina_g, lipidos_g, hco_g, fibra_g, sodio_mg)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [grupoId, nombre, medida, peso, kcal, prot, lip, hco, fibra, sodio]
        )
        totalAlimentos++
      }
      console.log(`  ✔ ${grupoClave}: ${alimentos.length} alimentos`)
    }

    await client.query('COMMIT')
    console.log(`\n🎉 Seed completo: ${totalAlimentos} alimentos del catálogo SMAE 2024/2026 cargados.`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error en seed SMAE:', err.message)
    throw err
  } finally {
    client.release()
    pool.end()
  }
}

seed()
