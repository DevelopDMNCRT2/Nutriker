export const chefInfo = {
  name: "Chef Mateo Restrepo",
  role: "Chef Nutricional & Especialista en Gastronomía Saludable",
  bio: "Diseñador de menús prácticos y balanceados para oficina, enfocados en energía sostenida, digestión ligera y facilidad de consumo.",
  avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
  signature: "Sabor excepcional, nutrición activa y platillos prácticos para tu jornada laboral."
};

export const nutriologaInfo = {
  name: "Nutrióloga Karla",
  role: "Nutrióloga Clinica & Responsable del Programa Nutricional",
  bio: "Supervisora del balance calórico, tolerancia de alérgenos y distribución de macronutrientes para el proyecto Retodali.",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  standards: "Cumplimiento del 100% de aportes proteicos sin exceder 520 kcal por porción."
};

export const programInfo = {
  name: "Nutrición",
  clientProject: "Retodali",
  clientName: "Empresa Retodali S.A. de C.V.",
  deliveryDays: ["Lunes", "Miércoles", "Viernes"],
  scheduleNote: "Entregas fijas en oficina antes de las 12:30 PM en contenedores ergonómicos",
  cycleLengthWeeks: 4,
  activeParticipantsCount: 45
};

export const cyclicMenus = [
  {
    weekNumber: 1,
    title: "Semana 1: Vitalidad & Digestión Ligera",
    days: [
      {
        dayName: "Lunes",
        dateLabel: "10 de Agosto, 2026",
        optionA: {
          id: "w1-mon-a",
          name: "Pechuga Grill con Crosta de Hierbas y Quinoa",
          category: "Balance Proteico",
          description: "Pechuga de pollo a la plancha marinada con romero y limón, servida con quinoa tricolor y calabacitas asadas cortadas en bocados ergonómicos.",
          image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
          calories: 480,
          protein: "38g",
          carbs: "42g",
          fats: "14g",
          tags: ["Alto en Proteína", "Práctico de Comer", "Sin Gluten"],
          allergens: [],
          recipe: {
            ingredients: "150g Pechuga de Pollo, 50g Quinoa tricolor, 80g Calabacitas, 10ml Aceite de Oliva, 2g Sal, 3g Romero fresco",
            method: "1. Macerar pollo con romero, aceite y sal.\n2. Cocinar a la plancha a 180°C por 6 mins por lado.\n3. Hervir quinoa en proporción 2:1 por 15 mins.\n4. Saltear calabacitas en cubos pequeños."
          }
        },
        optionB: {
          id: "w1-mon-b",
          name: "Bowl Mediterráneo de Garbanzos Rostizados y Aguacate",
          category: "Plant-Based & Balance",
          description: "Garbanzos especiados al paprika, pepino persa, jitomates cherry, aceitunas kalamata, mezcla de verdes silvestres y aderezo artesanal de tahini.",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
          calories: 420,
          protein: "16g",
          carbs: "52g",
          fats: "18g",
          tags: ["100% Vegano", "Rico en Fibra", "Antioxidante"],
          allergens: ["Ajonjolí"],
          recipe: {
            ingredients: "100g Garbanzos cocidos, 50g Pepino persa, 50g Jitomates cherry, 20g Aceitunas kalamata, 30g Aderezo tahini, 5g Paprika",
            method: "1. Rostizar garbanzos con paprika a 200°C por 15 mins.\n2. Cortar vegetales frescos en cubos medianos.\n3. Montar cama de verdes y bañar con aderezo tahini artesanal."
          }
        }
      },
      {
        dayName: "Miércoles",
        dateLabel: "12 de Agosto, 2026",
        optionA: {
          id: "w1-wed-a",
          name: "Wrap Ejecutivo de Pechuga de Pavo, Aguacate y Hummus",
          category: "Formato Ágil & Limpio",
          description: "Tortilla espinaca integral rellena de pechuga de pavo horneada en rebanadas, hummus casero, aguacate hass y vegetales crujientes. Cero olores fuertes y fácil de comer.",
          image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
          calories: 460,
          protein: "32g",
          carbs: "40g",
          fats: "16g",
          tags: ["Formato Wrap Ágil", "Ideal para Oficina", "Proteína Magra"],
          allergens: ["Gluten", "Ajonjolí"],
          recipe: {
            ingredients: "1 Tortilla espinaca (30cm), 100g Pechuga de Pavo, 40g Hummus, 40g Aguacate, 30g Pimientos, 15g Zanahoria rallada",
            method: "1. Calentar ligeramente la tortilla.\n2. Untar hummus como base.\n3. Colocar pavo, aguacate y vegetales.\n4. Enrollar apretado y cortar diagonalmente en dos piezas."
          }
        },
        optionB: {
          id: "w1-wed-b",
          name: "Wok de Tofu Marinado, Edamames y Arroz Integral",
          category: "Plant-Based",
          description: "Cubos de tofu firme glaseados en soya baja en sodio y jengibre, salteados con brócoli, pimientos multicolores y ajonjolí tostado.",
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
          calories: 410,
          protein: "22g",
          carbs: "48g",
          fats: "12g",
          tags: ["Proteína Vegetal", "Práctico", "Desintoxicante"],
          allergens: ["Soya", "Ajonjolí"],
          recipe: {
            ingredients: "120g Tofu firme, 60g Edamames pelados, 70g Arroz integral, 40g Brócoli, 15ml Soya baja en sodio, 5g Jengibre fresco",
            method: "1. Prensar tofu y cortar en cubos de 2cm.\n2. Sellar tofu en wok caliente.\n3. Agregar vegetales y glasear con soya y jengibre.\n4. Servir sobre arroz integral cocido."
          }
        }
      },
      {
        dayName: "Viernes",
        dateLabel: "14 de Agosto, 2026",
        optionA: {
          id: "w1-fri-a",
          name: "Medallones de Cerdo Magro al Romero y Puré de Camote",
          category: "Gourmet Práctico",
          description: "Filete de cerdo magro horneado con suave aderezo de romero, acompañado de camote horneado en cubos y ensalada fresca de espinaca baby y nuez.",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
          calories: 490,
          protein: "36g",
          carbs: "30g",
          fats: "19g",
          tags: ["Bajo en Carbohidratos", "Sabor Ejecutivo"],
          allergens: ["Nueces"],
          recipe: {
            ingredients: "150g Lomo/Filete de Cerdo, 100g Camote horneado, 50g Espinaca baby, 15g Nuez tostada, 10ml Aceite, 3g Romero",
            method: "1. Hornear medallones de cerdo marinados en romero a 190°C por 20 mins.\n2. Machacar camote horneado rústicamente.\n3. Ensamblar con ensalada fresca a un costado."
          }
        },
        optionB: {
          id: "w1-fri-b",
          name: "Curry Verde Ligero de Lentejas Coral y Coco",
          category: "Confort Nutritivo",
          description: "Lentejas rojas cocinadas con calabacita italiana y espinacas en salsa suave de coco, servidas con arroz jazmín al vapor en tazón profundo anti-derrames.",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
          calories: 440,
          protein: "18g",
          carbs: "58g",
          fats: "14g",
          tags: ["100% Vegano", "Anti-derrames"],
          allergens: [],
          recipe: {
            ingredients: "100g Lentejas coral (crudas), 80ml Leche de coco light, 40g Calabacita, 30g Espinaca, 5g Pasta curry verde, 60g Arroz jazmín",
            method: "1. Sofreír pasta curry levemente, añadir lentejas y agua.\n2. Hervir 15 mins, reducir fuego y agregar leche de coco y vegetales.\n3. Servir en contenedor hondo hermético."
          }
        }
      }
    ]
  },
  {
    weekNumber: 2,
    title: "Semana 2: Energía Activa & Enfoque",
    days: [
      {
        dayName: "Lunes",
        dateLabel: "17 de Agosto, 2026",
        optionA: {
          id: "w2-mon-a",
          name: "Tazón Fajita de Pollo Pastor Ligero con Arroz Integral",
          category: "Sabor Mexicano Saludable",
          description: "Tiras de pechuga marinadas en adobo casero magro, piña asada en cubos, arroz integral con cilantro y guacamole de la casa en porción individual.",
          image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
          calories: 510,
          protein: "35g",
          carbs: "45g",
          fats: "16g",
          tags: ["Alto en Proteína", "Sabor Tradicional"],
          allergens: []
        },
        optionB: {
          id: "w2-mon-b",
          name: "Nopal Asado Relleno de Panela Artesanal y Champiñones",
          category: "Vegetariano Balance",
          description: "Pencas de nopal tiernas horneadas con queso panela bajo en grasa, salteado de hongos de estación y salsa verde fresca de tomate verde.",
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
          calories: 380,
          protein: "20g",
          carbs: "26g",
          fats: "14g",
          tags: ["Vegetariano", "Muy Bajo en Carbohidratos"],
          allergens: ["Lácteos"]
        }
      },
      {
        dayName: "Miércoles",
        dateLabel: "19 de Agosto, 2026",
        optionA: {
          id: "w2-wed-a",
          name: "Ensalada César Proteica con Tiras de Pollo y Aderezo Ligero",
          category: "Fresco & Ágil",
          description: "Mezcla de lechugas romanas crujientes, pechuga de pollo a la parrilla, crutones de masa madre horneados y aderezo César bajo en calorías.",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
          calories: 420,
          protein: "35g",
          carbs: "18g",
          fats: "15g",
          tags: ["Comida Limpia & Ágil", "Bajo en Grasas"],
          allergens: ["Lácteos", "Gluten"]
        },
        optionB: {
          id: "w2-wed-b",
          name: "Tazón Nutritivo de Quinoa, Camote y Guisantes con Aderezo Miso",
          category: "Superfoods",
          description: "Combinación energizante de quinoa tricolor, cubos de camote rostizado, edamames, arándanos deshidratados y vinagreta suave de miso blanco.",
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
          calories: 450,
          protein: "15g",
          carbs: "60g",
          fats: "12g",
          tags: ["Vegano", "Rico en Fibra"],
          allergens: ["Soya"]
        }
      },
      {
        dayName: "Viernes",
        dateLabel: "21 de Agosto, 2026",
        optionA: {
          id: "w2-fri-a",
          name: "Lasagna Nutritiva de Calabacita y Carne Magra de Res",
          category: "Gourmet Proteico",
          description: "Láminas de calabacita italiana intercaladas con ragú casero de res magra, salsa de tomate rústica y un toque de requesón bajo en sodio en porción ejecutiva.",
          image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80",
          calories: 470,
          protein: "36g",
          carbs: "24g",
          fats: "18g",
          tags: ["Sin Gluten", "Proteína Confort"],
          allergens: ["Lácteos"]
        },
        optionB: {
          id: "w2-fri-b",
          name: "Buddha Bowl de Camote, Kale y Aderezo de Cacahuate",
          category: "Energía Completa",
          description: "Hojas de kale masajeadas en aceite de sésamo, camote horneado en cubos, tofu al grill, semillas de girasol y aderezo suave de cacahuate.",
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
          calories: 460,
          protein: "19g",
          carbs: "50g",
          fats: "20g",
          tags: ["Vegano", "Rico en Minerales"],
          allergens: ["Cacahuate", "Ajonjolí"]
        }
      }
    ]
  },
  {
    weekNumber: 3,
    title: "Semana 3: Balance Gourmet & Rendimiento",
    days: [
      {
        dayName: "Lunes",
        dateLabel: "24 de Agosto, 2026",
        optionA: {
          id: "w3-mon-a",
          name: "Pechuga Suprema Rellena de Espinacas y Queso Panela",
          category: "Gourmet Balance",
          description: "Pechuga de pollo deshuesada rellena de espinacas tiernas y queso panela suave, servida sobre cuscús de coliflor con piñones horneados.",
          image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
          calories: 495,
          protein: "40g",
          carbs: "18g",
          fats: "21g",
          tags: ["Bajo en Carbohidratos", "Proteína Magra"],
          allergens: ["Lácteos", "Nueces"]
        },
        optionB: {
          id: "w3-mon-b",
          name: "Panini Integral de Portobello, Jitomate Asado y Queso Gouda",
          category: "Formato Sandwich Ágil",
          description: "Pan de masa madre integral tostado con hongo portobello a la plancha, pesto ligero de albahaca y rebanadas de tomate asado.",
          image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80",
          calories: 460,
          protein: "17g",
          carbs: "54g",
          fats: "15g",
          tags: ["Sandwich Práctico", "Masa Madre"],
          allergens: ["Gluten", "Lácteos"]
        }
      },
      {
        dayName: "Miércoles",
        dateLabel: "26 de Agosto, 2026",
        optionA: {
          id: "w3-wed-a",
          name: "Tazón de Pollo Teriyaki Saludable con Arroz Jazmín y Brócoli",
          category: "Balance Oriental",
          description: "Tiras de pollo pechuga a la plancha con salsa teriyaki baja en sodio, arbolitos de brócoli al vapor, zanahorias baby y ajonjolí tostado.",
          image: "https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=600&q=80",
          calories: 480,
          protein: "38g",
          carbs: "44g",
          fats: "12g",
          tags: ["High Protein", "Comida Ágil"],
          allergens: ["Soya", "Ajonjolí"]
        },
        optionB: {
          id: "w3-wed-b",
          name: "Curry Amarillo de Garbanzos, Camote y Espinaca Baby",
          category: "Aromático Vegano",
          description: "Guiso aromático con cúrcuma fresca, jengibre y leche de coco ligera, acompañado de quinua real y chips de camote horneados.",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
          calories: 430,
          protein: "14g",
          carbs: "56g",
          fats: "13g",
          tags: ["Vegano", "Antiinflamatorio"],
          allergens: []
        }
      },
      {
        dayName: "Viernes",
        dateLabel: "28 de Agosto, 2026",
        optionA: {
          id: "w3-fri-a",
          name: "Burrito Bowl de Sirloin Magro con Vegetales Asados",
          category: "Proteína & Energía",
          description: "Tiras de sirloin horneadas a la parrilla, cebolla caramelizada, pimientos y frijoles enteros en tazón ergonómico para oficina.",
          image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
          calories: 510,
          protein: "37g",
          carbs: "34g",
          fats: "18g",
          tags: ["Comida Limpia", "Energizante"],
          allergens: []
        },
        optionB: {
          id: "w3-fri-b",
          name: "Chili de Frijoles Negros, Maíz Dulce y Aguacate Fresco",
          category: "Fibra & Vitalidad",
          description: "Estofado rico de frijoles negros, tomates asados, pimiento rojo y comino, servido con cubos de aguacate hass y totopos horneados.",
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
          calories: 420,
          protein: "16g",
          carbs: "58g",
          fats: "11g",
          tags: ["Alta Fibra", "Vegano"],
          allergens: []
        }
      }
    ]
  },
  {
    weekNumber: 4,
    title: "Semana 4: Renovación & Nutrición Consciente",
    days: [
      {
        dayName: "Lunes",
        dateLabel: "31 de Agosto, 2026",
        optionA: {
          id: "w4-mon-a",
          name: "Tacos Ejecutivos de Pollo al Pastor en Tortilla de Nopal",
          category: "Práctico & Ligero",
          description: "Tres tacos preparados con pechuga al pastor magro en tortillas de nopal bajas en carbohidratos, piña horneada y salsa verde en contenedores separados.",
          image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
          calories: 450,
          protein: "36g",
          carbs: "28g",
          fats: "12g",
          tags: ["Bajo en Carbohidratos", "Práctico de Comer"],
          allergens: []
        },
        optionB: {
          id: "w4-mon-b",
          name: "Risotto de Quinoa con Hongos Porcini y Aceite de Trufa",
          category: "Gourmet Vegetariano",
          description: "Cremosa preparación de quinoa real cocinada en caldo vegetal concentrado, mezcla de setas silvestre y un hilo de aceite de trufa blanca.",
          image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
          calories: 430,
          protein: "15g",
          carbs: "48g",
          fats: "16g",
          tags: ["Vegetariano", "Gourmet"],
          allergens: ["Lácteos"]
        }
      },
      {
        dayName: "Miércoles",
        dateLabel: "2 de Septiembre, 2026",
        optionA: {
          id: "w4-wed-a",
          name: "Pechuga de Pollo al Tikka Masala Suave con Arroz Basmati",
          category: "Sabor Especiado",
          description: "Cubos de pechuga de pollo marinados en especias indias suaves y yogur, cocinados en salsa de tomate y cilantro, fáciles de comer con tenedor.",
          image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
          calories: 470,
          protein: "35g",
          carbs: "42g",
          fats: "14g",
          tags: ["Sin Gluten", "Sin Olores Fuertes"],
          allergens: ["Lácteos"]
        },
        optionB: {
          id: "w4-wed-b",
          name: "Bowl Energético de Tempeh, Camote Asado y Brotes Verdes",
          category: "Plant-Based Power",
          description: "Tempeh orgánico a la plancha en bocados, brotes de girasol, camote en cubos horneados y vinagreta cítrica de naranja.",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
          calories: 420,
          protein: "20g",
          carbs: "46g",
          fats: "14g",
          tags: ["Vegano", "Probiótico"],
          allergens: ["Soya"]
        }
      },
      {
        dayName: "Viernes",
        dateLabel: "4 de Septiembre, 2026",
        optionA: {
          id: "w4-fri-a",
          name: "Pechuga de Pavo Horneada al Romero con Puré de Papa Nativa",
          category: "Confort Saludable",
          description: "Rebanadas magras de pavo horneado con romero fresco, acompañadas de puré artesanal de papa nativa y espárragos troceados.",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
          calories: 480,
          protein: "38g",
          carbs: "36g",
          fats: "14g",
          tags: ["Bajo en Grasa", "Ejecutivo Nutritivo"],
          allergens: []
        },
        optionB: {
          id: "w4-fri-b",
          name: "Tartaleta Rústica de Hummus, Berenjena Asada y Pimientos",
          category: "Mediterráneo",
          description: "Base crujiente integral rellena de hummus cremoso, láminas de berenjena a la parrilla, pimientos asados y orégano silvestre.",
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
          calories: 410,
          protein: "14g",
          carbs: "50g",
          fats: "15g",
          tags: ["Vegano", "Rico en Antioxidantes"],
          allergens: ["Gluten", "Ajonjolí"]
        }
      }
    ]
  }
];

export const sampleParticipants = [
  { id: 1, name: "Ana Sofía Morales", department: "Dirección", company: "Retodali", email: "sofia@retodali.com", phone: "+52 33 1234 5678", status: "Confirmado" },
  { id: 2, name: "Gilberto Rodríguez", department: "Administración", company: "Retodali", email: "gilberto@retodali.com", phone: "+52 33 2345 6789", status: "Confirmado" },
  { id: 3, name: "Demian Crate", department: "Desarrollo", company: "Retodali", email: "demian@crate.io", phone: "+52 33 3456 7890", status: "Confirmado" },
  { id: 4, name: "Carlos Mendoza", department: "Operaciones", company: "Retodali", email: "carlos@retodali.com", phone: "+52 33 5678 9012", status: "Confirmado" },
  { id: 5, name: "Mariana Torres", department: "Recursos Humanos", company: "Retodali", email: "mariana@retodali.com", phone: "+52 33 4567 8901", status: "Pendiente" }
];

export const financialStrategy = {
  modelType: "Esquema Mensual Distribuido",
  description: "Propuesta económica de transparencia administrativa. Permite diferir la inversión técnica y operativa en cuotas fijas mensuales para facilitar la aprobación financiera sin montos iniciales elevados.",
  monthlyBreakdown: [
    { concept: "Servicio Gastronómico Nutricional (Menús L/M/V)", costPerMeal: "$145 MXN", estimatedMonthly: "$39,150 MXN", detail: "45 participantes × 3 días/sem × 4 semanas" },
    { concept: "Gestión Operativa & Soporte Técnico (Plataforma de Nutrición)", costPerMeal: "$25 MXN equiv.", estimatedMonthly: "$6,750 MXN", detail: "Plataforma de notificaciones, control de menús y reportes de producción" },
    { concept: "Empaque Sustentable Ecológico & Logística de Entrega", costPerMeal: "$18 MXN equiv.", estimatedMonthly: "$4,860 MXN", detail: "Contenedores biodegradables ergonómicos e insumos ecológicos" }
  ],
  totalMonthlyEstimate: "$50,760 MXN",
  taxIncluded: "Factura fiscal emitida mensualmente por Nutrióloga Karla"
};
