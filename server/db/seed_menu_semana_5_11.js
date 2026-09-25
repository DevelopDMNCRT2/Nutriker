import pool from './pool.js'
import { generarIdUnico } from '../utils/generarId.js'

export async function seedMenuSemana5a11() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const semanaKey = '2026-10-05'
    const fechaInicio = '2026-10-05'
    const fechaFin = '2026-10-11'
    const empresas = ['Casa Nostra', 'Royal Canin']

    const menuData = {
      Lunes: {
        fecha: '2026-10-05',
        desayuno: {
          soup: {
            name: 'Avena Tibia Integral con Canela y Manzana',
            category: 'Sopa',
            calories: 180,
            protein: 6,
            carbs: 32,
            fats: 3,
            sodium: 80,
            ingredients: '50g Avena en hojuelas, 150ml Leche de almendras, 40g Manzana en cubos, 2g Canela en polvo',
            method: 'Cocer avena a fuego lento con leche vegetal y canela. Coronar con manzana.',
            image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Omelette Suave de Claras con Espinaca Baby',
            category: 'Platillo fuerte',
            calories: 220,
            protein: 24,
            carbs: 4,
            fats: 8,
            sodium: 210,
            ingredients: '3 Claras de huevo, 1 Huevo entero, 40g Espinaca baby fresca, 5ml Aceite de oliva',
            method: 'Batir claras y huevo. Cocinar a fuego medio con espinacas dobladas al centro.',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Tostada de Centeno con Aguacate y Semillas',
            category: 'Guarnicion',
            calories: 140,
            protein: 4,
            carbs: 18,
            fats: 6,
            sodium: 110,
            ingredients: '1 Rebanada de pan de centeno tostado, 30g Aguacate machacado, 5g Ajonjolí negro',
            method: 'Untar aguacate sazonado con pizca de sal marina y espolvorear semillas.',
            image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Papaya Dulce en Cubos con Chía Hidratada',
            category: 'Postre',
            calories: 75,
            protein: 2,
            carbs: 16,
            fats: 1,
            sodium: 15,
            ingredients: '100g Papaya maradol fresca, 5g Semillas de chía hidratadas en agua',
            method: 'Cortar papaya en dados parejos y servir fría con semillas de chía.',
            image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Crema Sedosa de Calabacita y Cilantro',
            category: 'Sopa',
            calories: 140,
            protein: 4,
            carbs: 16,
            fats: 6,
            sodium: 220,
            ingredients: '120g Calabacita italiana, 40g Poro, 80ml Fondo vegetal, 20ml Crema ligera',
            method: 'Saltear poro, incorporar calabacita y fondo. Hervir 12 min y licuar a textura aterciopelada.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Pechuga de Pollo Horneada al Romero y Cítricos',
            category: 'Platillo fuerte',
            calories: 440,
            protein: 40,
            carbs: 12,
            fats: 12,
            sodium: 320,
            ingredients: '160g Pechuga de pollo fresca, 5g Romero fresco picado, Jugo de naranja y limón, 5ml Aceite de oliva',
            method: 'Marinar 20 min y hornear a 185°C hasta alcanzar 74°C internos jugosos.',
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Puré Rústico de Camote Amarillo con Nuez',
            category: 'Guarnicion',
            calories: 190,
            protein: 4,
            carbs: 34,
            fats: 5,
            sodium: 110,
            ingredients: '130g Camote amarillo asado, 10g Nuez pecana triturada, 15ml Leche vegetal, Pizca de nuez moscada',
            method: 'Machacar camote horneado con leche tibia y finalizar con nueces tostadas.',
            image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Compota de Manzana Fuji al Horno con Canela',
            category: 'Postre',
            calories: 110,
            protein: 1,
            carbs: 26,
            fats: 1,
            sodium: 10,
            ingredients: '100g Manzana Fuji pelada y troceada, Rama de canela, Toque de esencia de vainilla',
            method: 'Estofar manzana a fuego muy bajo con canela hasta textura suave y tierna.',
            image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Consomé Clarificado de Ave con Juliana de Verduras',
            category: 'Sopa',
            calories: 110,
            protein: 8,
            carbs: 8,
            fats: 3,
            sodium: 210,
            ingredients: '200ml Fondo de ave desgrasado, 30g Zanahoria en juliana, 30g Chayote en juliana, Cilantro fino',
            method: 'Calentar caldo clarificado y blanquear las verduras al dente.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Filete de Robalo al Vapor con Aceite de Oliva y Finas Hierbas',
            category: 'Platillo fuerte',
            calories: 310,
            protein: 34,
            carbs: 2,
            fats: 8,
            sodium: 240,
            ingredients: '150g Filete de pescado blanco, Hierbas provenzales, 5ml Aceite de oliva virgen extra, Gotas de limón',
            method: 'Cocinar en vaporera 10 minutos para preservar máxima jugosidad y digestibilidad.',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Calabacitas Tiernas Salteadas con Flor de Calabaza',
            category: 'Guarnicion',
            calories: 85,
            protein: 3,
            carbs: 10,
            fats: 3,
            sodium: 120,
            ingredients: '120g Calabacita criolla rebanada, 20g Flor de calabaza limpia, Epazote picado',
            method: 'Saltear a la sartén con mínimo aceite hasta que estén suaves y brillantes.',
            image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Gelatina Artesanal de Jamaica Natural Infusionada',
            category: 'Postre',
            calories: 50,
            protein: 4,
            carbs: 8,
            fats: 0,
            sodium: 30,
            ingredients: '150ml Infusión concentrada de flor de jamaica, 7g Grenetina pura, Miel de agave ligera',
            method: 'Disolver grenetina en infusión tibia y cuajar en refrigeración 3 horas.',
            image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=600&q=80'
          }
        }
      },

      Martes: {
        fecha: '2026-10-06',
        desayuno: {
          soup: {
            name: 'Bowl de Yogur Griego Natural con Frutos Rojos',
            category: 'Sopa',
            calories: 190,
            protein: 15,
            carbs: 18,
            fats: 4,
            sodium: 65,
            ingredients: '120g Yogur griego natural sin azúcar, 40g Fresas rebanadas, 20g Arándanos frescos',
            method: 'Servir yogur frío con reducción fresca de frutos silvestres.',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Huevos Revueltos con Jitomate y Champiñones',
            category: 'Platillo fuerte',
            calories: 230,
            protein: 18,
            carbs: 6,
            fats: 14,
            sodium: 230,
            ingredients: '2 Huevos frescos, 40g Champiñones rebanados, 30g Jitomate picado, 5ml Aceite vegetal',
            method: 'Saltear hongos y jitomate, verter huevo batido y cocinar cremoso a fuego lento.',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Frijoles de la Olla Negros Estofados con Epazote',
            category: 'Guarnicion',
            calories: 130,
            protein: 7,
            carbs: 22,
            fats: 1,
            sodium: 140,
            ingredients: '100g Frijol negro cocido entero, Caldo de frijol, Hoja de epazote',
            method: 'Hervir despacio para concentrar sabor natural y suavizar fibra.',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Melón Cantaloupe en Medias Lunas',
            category: 'Postre',
            calories: 60,
            protein: 1,
            carbs: 14,
            fats: 0,
            sodium: 20,
            ingredients: '120g Melón cantaloupe maduro pelado',
            method: 'Cortar en gajos delgados y servir bien frío.',
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Sopa Tradicional de Lentejas Criollas con Vegetales',
            category: 'Sopa',
            calories: 170,
            protein: 9,
            carbs: 26,
            fats: 3,
            sodium: 260,
            ingredients: '60g Lentejas cocidas, 30g Zanahoria, 30g Apio, 150ml Fondo de verduras con comino',
            method: 'Estofar lentejas con vegetales picados en mirepoix hasta consistencia reconfortante.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Medallones de Filete de Res Magro con Reducción de Balsámico',
            category: 'Platillo fuerte',
            calories: 450,
            protein: 42,
            carbs: 6,
            fats: 16,
            sodium: 280,
            ingredients: '160g Filete de res magro, 15ml Reducción de vinagre balsámico y romero, 5ml Aceite de oliva',
            method: 'Sellar a la plancha término medio jugoso y bañar con reducción tibia.',
            image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Arroz Integral al Vapor con Chícharos y Maíz Dulce',
            category: 'Guarnicion',
            calories: 180,
            protein: 5,
            carbs: 36,
            fats: 2,
            sodium: 120,
            ingredients: '110g Arroz integral cocido, 25g Chícharos tiernos, 20g Granos de elote amarillo',
            method: 'Cocción al vapor lento con pizca de ajo y aceite de maíz.',
            image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Peras Pochadas en Infusión de Vainilla y Anís',
            category: 'Postre',
            calories: 120,
            protein: 1,
            carbs: 28,
            fats: 0,
            sodium: 10,
            ingredients: '1 Pera d’Anjou pelada, 1 Estrella de anís, 1 Vaina de vainilla natural, 150ml Agua',
            method: 'Pochado suave por 25 minutos hasta textura tierna que cede a la cuchara.',
            image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Crema Digestiva de Poro y Papa Criolla',
            category: 'Sopa',
            calories: 130,
            protein: 3,
            carbs: 22,
            fats: 4,
            sodium: 200,
            ingredients: '60g Poro blanco, 70g Papa cocida, 150ml Caldo vegetal claro, Pizca de nuez moscada',
            method: 'Pochar poro en mantequilla baja en sal, incorporar papas y caldo, licuar terso.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Tinga Suave de Pechuga de Pollo con Tortillas de Maíz',
            category: 'Platillo fuerte',
            calories: 340,
            protein: 32,
            carbs: 28,
            fats: 6,
            sodium: 310,
            ingredients: '130g Pechuga deshebrada, Caldillo de jitomate asado y orégano (sin picante), 2 Tortillas de maíz',
            method: 'Estofar pollo deshebrado en caldillo de jitomate suave a fuego lento.',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Ensalada de Espinaca Baby con Jitomate Cherry y Vinagreta Suave',
            category: 'Guarnicion',
            calories: 90,
            protein: 3,
            carbs: 6,
            fats: 6,
            sodium: 95,
            ingredients: '60g Espinaca baby limpia, 4 Jitomates cherry partidos, 5ml Vinagreta de limón y aceite de oliva',
            method: 'Mezclar en frío momentos antes de servir para preservar frescura crocante.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Mousse Ligero de Mango Criollo con Toque Cítrico',
            category: 'Postre',
            calories: 85,
            protein: 3,
            carbs: 18,
            fats: 1,
            sodium: 25,
            ingredients: '80g Pulpa natural de mango, 40g Yogur natural descremado, Gotas de limón eureka',
            method: 'Emulsionar pulpa de mango con yogur y enfriar en copas individuales.',
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
          }
        }
      },

      Miércoles: {
        fecha: '2026-10-07',
        desayuno: {
          soup: {
            name: 'Jugo Verde Prensado en Frío (Nopal, Piña y Apio)',
            category: 'Sopa',
            calories: 95,
            protein: 2,
            carbs: 20,
            fats: 0,
            sodium: 40,
            ingredients: '50g Nopal tierno, 60g Piña miel, 30g Tallo de apio, 100ml Agua purificada',
            method: 'Prensado en frío para retener minerales y enzimas activas.',
            image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Chilaquiles Suaves Horneados con Queso Panela y Pollo',
            category: 'Platillo fuerte',
            calories: 360,
            protein: 28,
            carbs: 38,
            fats: 9,
            sodium: 320,
            ingredients: '60g Totopos de maíz horneados sin grasa, 100ml Salsa de jitomate suave, 80g Pollo deshebrado, 30g Queso panela',
            method: 'Bañar totopos en salsa caliente, coronar con pollo y panela desmoronada.',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Frijoles Bayos Machacados sin Manteca',
            category: 'Guarnicion',
            calories: 120,
            protein: 6,
            carbs: 20,
            fats: 2,
            sodium: 130,
            ingredients: '90g Frijol bayo cocido, 5ml Aceite vegetal, Pizca de cebolla sofrita',
            method: 'Machacar a mano en sartén caliente con cebolla salteada ligera.',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Gajos de Naranja Dulce con Miel de Maguey',
            category: 'Postre',
            calories: 70,
            protein: 1,
            carbs: 16,
            fats: 0,
            sodium: 10,
            ingredients: '120g Gajos de naranja suprema sin semillas, 5ml Miel de maguey pura',
            method: 'Obtener supremas de naranja y rociar con gotas de miel de maguey.',
            image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Caldo Tlalpeño Desgrasado con Verduras y Garbanzo',
            category: 'Sopa',
            calories: 160,
            protein: 8,
            carbs: 22,
            fats: 4,
            sodium: 280,
            ingredients: '200ml Fondo de ave clarificado, 30g Garbanzo tierno, 30g Zanahoria, 20g Ejotes tiernos, Toque de epazote',
            method: 'Cocer a fuego medio integrando garbanzos y hortalizas tiernas.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Filete de Salmón Noruego Sellado a las Finas Hierbas',
            category: 'Platillo fuerte',
            calories: 480,
            protein: 38,
            carbs: 4,
            fats: 20,
            sodium: 290,
            ingredients: '150g Filete de salmón fresco, Eneldo fresco, Ralladura de limón eureka, 5ml Aceite de oliva virgen',
            method: 'Sellar piel crocante 4 minutos y voltear 2 minutos para centro sedoso.',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Quinoa Tricolor Salteada con Espárragos y Pimientos',
            category: 'Guarnicion',
            calories: 175,
            protein: 6,
            carbs: 28,
            fats: 4,
            sodium: 110,
            ingredients: '90g Quinoa tricolor cocida, 40g Puntas de espárrago verde, 25g Pimiento rojo en brunoise',
            method: 'Saltear vegetales al wok e incorporar la quinoa al vapor con sal de mar.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Pudín Ligero de Chía con Coulis de Zarzamora Silvestre',
            category: 'Postre',
            calories: 130,
            protein: 4,
            carbs: 18,
            fats: 4,
            sodium: 35,
            ingredients: '15g Semillas de chía, 100ml Leche de almendras sin azúcar, 30g Coulis de zarzamora casero',
            method: 'Hidratar chía 4 horas en frío y servir coronada con coulis morado.',
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Crema Ligera de Zanahoria al Jengibre',
            category: 'Sopa',
            calories: 120,
            protein: 3,
            carbs: 20,
            fats: 3,
            sodium: 190,
            ingredients: '120g Zanahoria cocida, 3g Jengibre fresco rallado, 120ml Fondo de verduras, Pizca de cúrcuma',
            method: 'Hervir zanahorias con toque aromático de jengibre y procesar terso.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Quesadillas de Comal de Maíz con Flor de Calabaza y Panela',
            category: 'Platillo fuerte',
            calories: 320,
            protein: 20,
            carbs: 34,
            fats: 10,
            sodium: 260,
            ingredients: '2 Tortillas de maíz criollo, 50g Queso panela bajo en sodio, 30g Flor de calabaza limpia, Epazote',
            method: 'Calentar en comal sin grasa hasta fundir suavemente el queso panela.',
            image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Chayotes Tiernos al Vapor con Toque de Orégano Silvestre',
            category: 'Guarnicion',
            calories: 70,
            protein: 2,
            carbs: 10,
            fats: 2,
            sodium: 80,
            ingredients: '130g Chayote sin espinas en cubos, Orégano seco frotado, Gotas de aceite de oliva',
            method: 'Cocción al vapor 8 minutos para conservar firmeza y dulzor natural.',
            image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Rebanadas de Pera Verde con Canela',
            category: 'Postre',
            calories: 75,
            protein: 1,
            carbs: 18,
            fats: 0,
            sodium: 10,
            ingredients: '120g Pera fresca cortada en rebanadas finas, Pizca de canela molida',
            method: 'Disponer las láminas de pera en abanico y espolvorear canela aromática.',
            image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
          }
        }
      },

      Jueves: {
        fecha: '2026-10-08',
        desayuno: {
          soup: {
            name: 'Licuado Nutritivo de Avena, Plátano y Cacao Puro',
            category: 'Sopa',
            calories: 210,
            protein: 8,
            carbs: 38,
            fats: 4,
            sodium: 70,
            ingredients: '150ml Leche descremada, 30g Avena en hojuelas, 1/2 Plátano maduro, 5g Cacao puro sin azúcar',
            method: 'Licuar a alta velocidad hasta consistencia espumosa y homogénea.',
            image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Pechuga de Pavo a la Plancha con Jitomate Asado',
            category: 'Platillo fuerte',
            calories: 240,
            protein: 30,
            carbs: 6,
            fats: 7,
            sodium: 280,
            ingredients: '130g Pechuga de pavo natural en rebanadas, 1 Jitomate maduro a la plancha, Orégano',
            method: 'Marcar en parrilla caliente con gotas de aceite vegetal.',
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Guacamole Rústico con Gotas de Limón Colima',
            category: 'Guarnicion',
            calories: 130,
            protein: 2,
            carbs: 8,
            fats: 11,
            sodium: 90,
            ingredients: '50g Aguacate hass machacado, 10g Pico de gallo sin picante, Gotas de limón Colima',
            method: 'Mezclar rústicamente conservando textura de los ingredientes.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Brocheta de Frutas Frescas (Melón, Fresa y Uva)',
            category: 'Postre',
            calories: 65,
            protein: 1,
            carbs: 15,
            fats: 0,
            sodium: 12,
            ingredients: '40g Melón verde, 40g Fresas enteras, 30g Uvas sin semilla',
            method: 'Ensartar frutas frescas alternadas en palillo de bambú.',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Minestrone Campirano de Hortalizas y Albahaca Fresca',
            category: 'Sopa',
            calories: 145,
            protein: 5,
            carbs: 24,
            fats: 3,
            sodium: 240,
            ingredients: '40g Calabacita, 30g Zanahoria, 30g Ejote, 20g Pasta fideo integral, Albahaca fresca picada',
            method: 'Cocer verduras en caldillo de jitomate perfumado con albahaca.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Fajitas de Pollo Orgánico Salteadas con Trilogía de Pimientos',
            category: 'Platillo fuerte',
            calories: 430,
            protein: 38,
            carbs: 14,
            fats: 12,
            sodium: 310,
            ingredients: '160g Tiras de pechuga magra, 40g Pimiento rojo, 40g Pimiento verde, 30g Cebolla morada',
            method: 'Saltear a fuego vivo en wok con gotas de aceite de oliva.',
            image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Puré Aterciopelado de Papa con Aceite de Oliva y Perejil',
            category: 'Guarnicion',
            calories: 160,
            protein: 4,
            carbs: 28,
            fats: 4,
            sodium: 120,
            ingredients: '120g Papa blanca cocida, 5ml Aceite de oliva virgen extra, 3g Perejil fresco picado',
            method: 'Triturar papas al punto con aceite y perejil para evitar grasas saturadas.',
            image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Manzana Gala Asada al Horno con Nuez Moscada',
            category: 'Postre',
            calories: 105,
            protein: 1,
            carbs: 24,
            fats: 1,
            sodium: 10,
            ingredients: '1 Manzana Gala descorazonada, 1g Nuez moscada, 10ml Jugo de manzana natural',
            method: 'Hornear a 180°C durante 20 minutos hasta piel suave y centro tierno.',
            image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Consomé Suave de Champiñones y Epazote',
            category: 'Sopa',
            calories: 90,
            protein: 4,
            carbs: 12,
            fats: 2,
            sodium: 190,
            ingredients: '80g Champiñones frescos rebanados, 150ml Fondo vegetal, Rama tierna de epazote',
            method: 'Hervir champiñones a fuego medio extrayendo sus aromas térreos naturales.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Rollitos de Jamón de Pavo Rellenos de Verduras al Vapor',
            category: 'Platillo fuerte',
            calories: 270,
            protein: 26,
            carbs: 10,
            fats: 6,
            sodium: 330,
            ingredients: '3 Rebanadas de pechuga de pavo bajo en sodio, 60g Zanahoria y calabacita en bastones blanqueados',
            method: 'Armar rollos rellenos de bastones y entibiar en vaporera ligera.',
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Ensalada de Pepino Persa con Limón y Chía',
            category: 'Guarnicion',
            calories: 60,
            protein: 2,
            carbs: 8,
            fats: 2,
            sodium: 70,
            ingredients: '100g Pepino persa en rodajas finas, Gotas de limón verde, Pizca de orégano y chía',
            method: 'Marinar rodajas en frío con cítricos 10 minutos.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Gelatina Ligera de Frutos del Bosque',
            category: 'Postre',
            calories: 55,
            protein: 4,
            carbs: 9,
            fats: 0,
            sodium: 25,
            ingredients: '140ml Infusión de frutos rojos silvestres, 6g Grenetina de alta pureza',
            method: 'Mezclar con infusión a 45°C y enfriar en moldes individuales.',
            image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=600&q=80'
          }
        }
      },

      Viernes: {
        fecha: '2026-10-09',
        desayuno: {
          soup: {
            name: 'Porridge Tibio de Avena con Almendras Fileteadas',
            category: 'Sopa',
            calories: 195,
            protein: 7,
            carbs: 30,
            fats: 5,
            sodium: 75,
            ingredients: '45g Avena, 130ml Leche deslactosada, 10g Almendras fileteadas tostadas',
            method: 'Hervir avena a punto crema y decorar con almendra crocante.',
            image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Huevos a la Mexicana Suaves con Frijoles Refritos Ligeros',
            category: 'Platillo fuerte',
            calories: 280,
            protein: 20,
            carbs: 14,
            fats: 14,
            sodium: 290,
            ingredients: '2 Huevos enteros, 30g Jitomate picado, 20g Cebolla blanca, 1 Tortilla de maíz',
            method: 'Saltear jitomate y cebolla, añadir huevo y revolver tierno a calor moderado.',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Nopalitos Asados a la Plancha con Orégano',
            category: 'Guarnicion',
            calories: 55,
            protein: 2,
            carbs: 9,
            fats: 1,
            sodium: 85,
            ingredients: '120g Nopales baby cortados en tiras, Gotas de aceite de maíz, Orégano molido',
            method: 'Asar a la plancha hasta retirar baba natural y dorar ligeramente.',
            image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Plátano Tabasco Rebanado con Canela en Polvo',
            category: 'Postre',
            calories: 90,
            protein: 1,
            carbs: 22,
            fats: 0,
            sodium: 5,
            ingredients: '90g Plátano tabasco rebanado, Pizca de canela fina de Ceilán',
            method: 'Cortar rodajas parejas y espolvorear canela aromática.',
            image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Crema Ligera de Elote Tierno y Pimientos Asados',
            category: 'Sopa',
            calories: 155,
            protein: 5,
            carbs: 26,
            fats: 4,
            sodium: 230,
            ingredients: '100g Granos de elote tierno cocidos, 30g Pimiento amarillo asado, 100ml Fondo de ave',
            method: 'Licuar granos tiernos con fondo y pasar por colador fino para textura de seda.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Medallones de Lomo de Cerdo Magro al Jugo de Manzana',
            category: 'Platillo fuerte',
            calories: 420,
            protein: 38,
            carbs: 16,
            fats: 14,
            sodium: 300,
            ingredients: '160g Lomo de cerdo desgrasado, 40ml Reducción de jugo de manzana y tomillo, 5ml Aceite',
            method: 'Sellar lomo a fuego vivo y hornear tapado 15 minutos en su jugo.',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Arroz Blanco Tradicional al Vapor con Cubos de Zanahoria',
            category: 'Guarnicion',
            calories: 170,
            protein: 4,
            carbs: 34,
            fats: 2,
            sodium: 110,
            ingredients: '100g Arroz blanco de grano largo al vapor, 30g Zanahoria tierna en macedonia',
            method: 'Cocción hermética al vapor con diente de ajo entero retirado al final.',
            image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Nieve Artesanal de Limón Colima sin Lácteos',
            category: 'Postre',
            calories: 95,
            protein: 0,
            carbs: 24,
            fats: 0,
            sodium: 15,
            ingredients: '100ml Infusión de cáscara de limón, 25ml Jugo natural de limón Colima, Miel de agave',
            method: 'Batido en congelación intermitente para textura de sorbete fino.',
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Caldo Clarificado de Verduras de Temporada',
            category: 'Sopa',
            calories: 85,
            protein: 3,
            carbs: 14,
            fats: 1,
            sodium: 180,
            ingredients: '200ml Fondo de apio, poro y zanahoria, Rama de cilantro fresco',
            method: 'Infusión a fuego lento de hortalizas frescas coladas limpiamente.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Pescado Blanco en Papillote con Hortalizas Tiernas',
            category: 'Platillo fuerte',
            calories: 290,
            protein: 34,
            carbs: 6,
            fats: 6,
            sodium: 240,
            ingredients: '150g Filete de pescado magro, 30g Calabacita en juliana, 30g Poro, Gotas de vino blanco',
            method: 'Cocción hermética en papel estrella a 190°C por 12 minutos concentrando sus propios jugos.',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Ensalada Verde de Lechugas Mixtas con Pepino y Aceite de Oliva',
            category: 'Guarnicion',
            calories: 80,
            protein: 2,
            carbs: 6,
            fats: 5,
            sodium: 60,
            ingredients: '70g Mezcla de lechuga orejona y romana, 40g Pepino en medias lunas, 5ml Aceite de oliva virgen',
            method: 'Lavar, centrifugar y aderezar al momento de servir.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Manzana Cocida al Vapor con Canela',
            category: 'Postre',
            calories: 80,
            protein: 0,
            carbs: 20,
            fats: 0,
            sodium: 10,
            ingredients: '100g Manzana Golden en rodajas, Canela en polvo',
            method: 'Cocinar al vapor 7 minutos hasta textura fundente.',
            image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80'
          }
        }
      },
      Sábado: {
        fecha: '2026-10-10',
        desayuno: {
          soup: {
            name: 'Fruta Fresca de Temporada con Yogur Griego y Semillas de Girasol',
            category: 'Sopa',
            calories: 160,
            protein: 7,
            carbs: 22,
            fats: 4,
            sodium: 50,
            ingredients: '80g Melón y fresas en dados, 60g Yogur griego natural sin azúcar, 5g Semillas de girasol peladas',
            method: 'Servir fruta fría coronada con yogur griego y semillas crujientes.',
            image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Huevos Pochados con Salsa Pomodoro Suave y Albahaca',
            category: 'Platillo fuerte',
            calories: 230,
            protein: 18,
            carbs: 6,
            fats: 12,
            sodium: 240,
            ingredients: '2 Huevos frescos de granja, 80g Jitomate escalfado triturado, 3g Albahaca fresca, 5ml Aceite de oliva',
            method: 'Pochar huevos en agua tibia con vinagre 3 minutos. Bañar en salsa pomodoro rústica tibia.',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Frijoles Negros Molidos Tersos a las Finas Hierbas',
            category: 'Guarnicion',
            calories: 150,
            protein: 8,
            carbs: 24,
            fats: 2,
            sodium: 140,
            ingredients: '90g Frijol negro cocido sin manteca, Pizca de epazote seco y orégano',
            method: 'Licuar con caldo de cocción hasta emulsión cremosa sin hollejos perceptibles.',
            image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Rebanadas de Melón Dulce con Menta Fresca',
            category: 'Postre',
            calories: 60,
            protein: 1,
            carbs: 14,
            fats: 0,
            sodium: 15,
            ingredients: '120g Melón cantaloupe en finas rebanadas, Hojas de menta fresca',
            method: 'Disponer en abanico y aromatizar con menta fresca deshojada.',
            image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Sopa Campesina de Verduras Frescas y Poritos al Vapor',
            category: 'Sopa',
            calories: 120,
            protein: 3,
            carbs: 16,
            fats: 3,
            sodium: 190,
            ingredients: '50g Zanahoria baby, 40g Calabacita, 30g Poro tierno, 120ml Fondo vegetal natural',
            method: 'Cocer verduras al dente en caldo aromático con pimienta gorda y laurel.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Pechuga Cordon Bleu Horneada Suave con Panela y Pavo',
            category: 'Platillo fuerte',
            calories: 420,
            protein: 38,
            carbs: 16,
            fats: 14,
            sodium: 320,
            ingredients: '150g Pechuga de pollo abierta, 30g Jamón de pavo bajo en sodio, 30g Queso panela, 15g Apanado fino horneado',
            method: 'Rellenar pechuga, hornear a 180°C durante 20 minutos hasta dorado suave sin freír.',
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Arroz Blanco al Vapor con Pimientos Dulces y Chícharos',
            category: 'Guarnicion',
            calories: 170,
            protein: 4,
            carbs: 32,
            fats: 2,
            sodium: 90,
            ingredients: '100g Arroz cocido al vapor, 20g Pimiento morrón rojo picado, 20g Chícharos tiernos',
            method: 'Mezclar arroz caliente con vegetales blanqueados al vapor.',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Peras Pochadas al Anís con Canela y Miel Suave',
            category: 'Postre',
            calories: 110,
            protein: 1,
            carbs: 26,
            fats: 0,
            sodium: 20,
            ingredients: '1 Pera d’Anjou madura, 1 Estrella de anís, Rama de canela, 5g Miel de abeja',
            method: 'Pochar a fuego suave 15 minutos en infusión aromática. Servir templada.',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Consomé Desgrasado de Ternera con Verduras Finamente Picadas',
            category: 'Sopa',
            calories: 110,
            protein: 8,
            carbs: 8,
            fats: 2,
            sodium: 210,
            ingredients: '150ml Caldo clarificado de ternera, 30g Zanahoria y calabacita brunoise',
            method: 'Hervir y clarificar para retirar toda grasa visible. Servir bien caliente.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Pescado Blanco en Crema Ligera de Cilantro y Limón',
            category: 'Platillo fuerte',
            calories: 310,
            protein: 32,
            carbs: 6,
            fats: 10,
            sodium: 220,
            ingredients: '150g Filete de lubina o tilapia magra, 30ml Crema baja en grasa, Jugo de medio limón, Cilantro fresco picado',
            method: 'Sellar pescado a la plancha y salsear con emulsión tibia de cilantro aromático.',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Puré Suave de Chayote con Toque de Queso Ricotta',
            category: 'Guarnicion',
            calories: 120,
            protein: 5,
            carbs: 14,
            fats: 4,
            sodium: 110,
            ingredients: '140g Chayote cocido sin cáscara, 25g Queso ricotta descremado, Pizca de nuez moscada',
            method: 'Prensar chayote caliente con ricotta hasta obtener textura aterciopelada.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Gelatina Cítrica Enriquecida con Colágeno y Suplemento',
            category: 'Postre',
            calories: 70,
            protein: 8,
            carbs: 10,
            fats: 0,
            sodium: 40,
            ingredients: '120ml Gelatina de mandarina casera, 8g Colágeno hidrolizado sin sabor',
            method: 'Disolver colágeno en jugo de mandarina tibio y refrigerar 4 horas.',
            image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80'
          }
        }
      },
      Domingo: {
        fecha: '2026-10-11',
        desayuno: {
          soup: {
            name: 'Atole Nutritivo de Avena y Vainilla sin Azúcar Añadida',
            category: 'Sopa',
            calories: 170,
            protein: 6,
            carbs: 28,
            fats: 3,
            sodium: 70,
            ingredients: '40g Harina de avena integral, 180ml Leche descremada, Extracto de vainilla natural, Canela',
            method: 'Cocer a fuego medio batiendo constantemente hasta espesar suavemente.',
            image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Chilaquiles Suaves No Picantes con Pollo Deshebrado y Queso Panela',
            category: 'Platillo fuerte',
            calories: 340,
            protein: 26,
            carbs: 30,
            fats: 11,
            sodium: 280,
            ingredients: '50g Totopos horneados sin sal, 70g Pechuga de pollo cocida deshebrada, 90g Caldillo de jitomate con orégano, 25g Panela',
            method: 'Remojar totopos en caldillo caliente para ablandar textura. Montar con pollo y panela desmoronada.',
            image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Guacamole Rústico con Gotas de Limón y Jitomate Concassé',
            category: 'Guarnicion',
            calories: 130,
            protein: 2,
            carbs: 8,
            fats: 11,
            sodium: 90,
            ingredients: '60g Aguacate Hass maduro machacado, 20g Jitomate sin piel ni semillas, Gotas de limón',
            method: 'Machacar ingredientes suavemente conservando frescura y textura tersa.',
            image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Cocktail de Piña Miel y Frutos Rojos Antioxidantes',
            category: 'Postre',
            calories: 80,
            protein: 1,
            carbs: 18,
            fats: 0,
            sodium: 10,
            ingredients: '70g Piña miel en cubos pequeños, 30g Arándanos y frambuesas frescas',
            method: 'Combinar frutas en copa fría y perfumar con hojas de menta.',
            image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80'
          }
        },
        comida: {
          soup: {
            name: 'Crema Delicada de Elote Tierno con Hierbas Aromáticas',
            category: 'Sopa',
            calories: 150,
            protein: 4,
            carbs: 20,
            fats: 5,
            sodium: 210,
            ingredients: '100g Granos de elote tierno cocido, 80ml Fondo de pollo natural, 25ml Leche vegetal, Pizca de epazote',
            method: 'Licuar y colar finamente para una textura sedosa sin residuos de hollejo.',
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Medallón de Solomillo de Cerdo en Salsa de Ciruela Suave',
            category: 'Platillo fuerte',
            calories: 410,
            protein: 36,
            carbs: 18,
            fats: 12,
            sodium: 290,
            ingredients: '150g Medallón de lomo magro, 40g Pulpa de ciruela pasa natural sin azúcar, 50ml Fondo de carne claro',
            method: 'Cocinar medallón al punto suave y cubrir con salsa tibia de ciruela reducida.',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Papas Galeana al Vapor con Finas Hierbas y Aceite de Oliva',
            category: 'Guarnicion',
            calories: 160,
            protein: 3,
            carbs: 28,
            fats: 4,
            sodium: 100,
            ingredients: '120g Papa galeana tierna al vapor, 5ml Aceite de oliva, Romero y tomillo secos',
            method: 'Cocer al vapor hasta fundentes por dentro y saltear 1 minuto con hierbas aromáticas.',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Mousse Ligero de Mango Tropical con Chía',
            category: 'Postre',
            calories: 120,
            protein: 4,
            carbs: 20,
            fats: 2,
            sodium: 30,
            ingredients: '80g Pulpa de mango Ataulfo, 40g Yogur griego natural, 3g Chía hidratada',
            method: 'Montar pulpa con yogur hasta textura aireada y refrigerar antes del servicio.',
            image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80'
          }
        },
        cena: {
          soup: {
            name: 'Caldo Tlalpeño Institucional Suave sin Grasa ni Picante',
            category: 'Sopa',
            calories: 130,
            protein: 10,
            carbs: 12,
            fats: 2,
            sodium: 200,
            ingredients: '150ml Caldo clarificado de ave, 25g Garbanzo pelado cocido, 25g Calabacita, 30g Pollo deshebrado fino',
            method: 'Hervir suavemente los ingredientes integrados para una digestión nocturna confortable.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'
          },
          optionA: {
            name: 'Sincronizada Ligera de Jamón de Pavo y Queso Oaxaca en Tortilla de Trigo Integral',
            category: 'Platillo fuerte',
            calories: 280,
            protein: 22,
            carbs: 24,
            fats: 8,
            sodium: 260,
            ingredients: '1 Tortilla de trigo integral suave, 35g Jamón de pavo bajo en sodio, 30g Queso Oaxaca deshebrado',
            method: 'Calentar en comal a fuego bajo hasta fundir el queso sin tostar la tortilla.',
            image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
          },
          optionB: {
            name: 'Zanahorias Glaseadas al Vapor con Miel de Abeja',
            category: 'Guarnicion',
            calories: 100,
            protein: 2,
            carbs: 20,
            fats: 1,
            sodium: 80,
            ingredients: '130g Zanahoria en rodajas finas al vapor, 5g Miel de abeja pura, Pizca de canela',
            method: 'Cocinar al vapor y terminar con un toque delicado de miel tibia.',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
          },
          optionC: {
            name: 'Compota Casera de Manzana y Pera con Toque de Canela',
            category: 'Postre',
            calories: 90,
            protein: 1,
            carbs: 22,
            fats: 0,
            sodium: 15,
            ingredients: '60g Manzana en dados, 60g Pera en dados, Rama de canela hervida',
            method: 'Cocer a fuego muy lento con su propio jugo hasta consistencia suave de compota.',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
          }
        }
      }
    }

    for (const empresa of empresas) {
      console.log(`\n📋 Procesando menú para empresa: ${empresa}...`)

      // 1. Obtener o crear menú en menus_b2b
      const menuRes = await client.query(
        'SELECT id FROM menus_b2b WHERE empresa = $1 AND semana_key = $2',
        [empresa, semanaKey]
      )

      let menuId
      if (menuRes.rowCount > 0) {
        menuId = menuRes.rows[0].id
        await client.query(
          `UPDATE menus_b2b 
           SET dias_servicio = 7, publicado = true, fecha_inicio = $1, fecha_fin = $2,
               titulo_opcion_a = 'Platillo fuerte', titulo_opcion_b = 'Guarnicion', titulo_opcion_c = 'Postre',
               publicado_en = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [fechaInicio, fechaFin, menuId]
        )
        await client.query('DELETE FROM menu_b2b_dias WHERE menu_id = $1', [menuId])
        console.log(`  🔄 Menú existente actualizado (ID: ${menuId}). Registros de días reiniciados.`)
      } else {
        menuId = await generarIdUnico('menus_b2b')
        await client.query(
          `INSERT INTO menus_b2b (
            id, empresa, semana_key, semana_numero, dias_servicio, publicado, 
            fecha_inicio, fecha_fin, titulo_opcion_a, titulo_opcion_b, titulo_opcion_c, publicado_en
          ) VALUES ($1, $2, $3, 9, 7, true, $4, $5, 'Platillo fuerte', 'Guarnicion', 'Postre', CURRENT_TIMESTAMP)`,
          [menuId, empresa, semanaKey, fechaInicio, fechaFin]
        )
        console.log(`  ✨ Nuevo menú creado (ID: ${menuId}).`)
      }

      // 2. Insertar cada día, cada servicio (desayuno, comida, cena) y cada tiempo (S, A, B, C)
      let count = 0
      for (const [dayName, dayContent] of Object.entries(menuData)) {
        const diaFecha = dayContent.fecha

        for (const [servicioKey, sData] of Object.entries(dayContent)) {
          if (servicioKey === 'fecha') continue

          const mapping = [
            { code: 'S', data: sData.soup, defaultCat: 'Sopa' },
            { code: 'A', data: sData.optionA, defaultCat: 'Platillo fuerte' },
            { code: 'B', data: sData.optionB, defaultCat: 'Guarnicion' },
            { code: 'C', data: sData.optionC, defaultCat: 'Postre' }
          ]

          for (const item of mapping) {
            if (!item.data) continue

            const diaId = await generarIdUnico('menu_b2b_dias')
            await client.query(
              `INSERT INTO menu_b2b_dias (
                id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, categoria,
                calorias, proteinas_g, carbohidratos_g, grasas_g, sodio_mg,
                ingredientes, metodo_preparacion, imagen_url, servicio
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
              [
                diaId,
                menuId,
                dayName,
                diaFecha,
                item.code,
                item.data.name,
                item.data.category || item.defaultCat,
                item.data.calories,
                item.data.protein,
                item.data.carbs,
                item.data.fats,
                item.data.sodium || 220,
                item.data.ingredients,
                item.data.method,
                item.data.image,
                servicioKey
              ]
            )
            count++
          }
        }
      }
      console.log(`  ✅ ${count} platillos institucionales insertados para ${empresa}.`)
    }

    await client.query('COMMIT')
    console.log(`\n🎉 Menú institucional completo de Lunes a Domingo para la semana del 5 al 11 (${semanaKey}) sembrado exitosamente en Neon PostgreSQL!`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al sembrar menú de semana 5 a 11:', error)
  } finally {
    client.release()
    process.exit(0)
  }
}

// Ejecución directa si se invoca con `node server/db/seed_menu_semana_5_11.js`
seedMenuSemana5a11()
