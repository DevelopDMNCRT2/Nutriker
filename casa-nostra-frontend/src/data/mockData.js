export const serviceProfiles = {
  casa_nostra: {
    id: 'casa_nostra',
    name: 'Casa Nostra - Residencia de Mayores',
    type: 'senior_care',
    recipientRole: 'Residente / Enfermería',
    accentColor: '#B45309',
    bgColor: '#FEF3C7',
    features: {
      iddsiLevels: true,
      strictHyposodic: true,
      humanAudit: true,
      proteinTracking: true
    }
  }
};

export const getActiveServiceProfile = (profileKey = 'casa_nostra') => {
  return serviceProfiles[profileKey] || serviceProfiles.casa_nostra;
};

export const programInfo = {
  name: "Alimentación Geriátrica",
  clientProject: "Casa Nostra",
  clientName: "Residencia Casa Nostra",
  deliveryDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
  scheduleNote: "Servicio de 3 tiempos + colaciones. Menú de fácil masticación y alto en proteína.",
  cycleLengthWeeks: 2,
  activeParticipantsCount: 25 // 25 residents approx
};

export const nutriologaInfo = {
  name: "Dra. Karla",
  role: "Nutrióloga Clínica",
  license: "CED. 8923145",
  specialties: ["Geriatría", "Nutrición Enteral y Suplementación"]
};

export const chefInfo = {
  name: "Chef Paola / Fabiola",
  role: "Chef Ejecutivo de Residencia",
  station: "Cocina Casa Nostra"
};

const weekOneMenu = {
  weekNumber: 1,
  weekName: "Semana 1 - Menú Tradicional",
  focus: "Alto en Proteína y Fácil Masticación",
    days: [
      {
        dayName: "Lunes",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Tortitas de Papa con Atún y Caldo de Pollo",
          recipe: {
            method: "1. Preparar caldo de pollo natural (sin consomé en polvo).\n2. Mezclar puré de papa con atún drenado y huevo.\n3. Formar tortitas y dorar ligeramente en sartén antiadherente.\n4. Servir con verduras cocidas extra suaves.",
            ingredients: "120g Atún en agua, 150g Papa cocida, 0.5pza Huevo, 200ml Caldo de pollo natural, 80g Zanahoria cocida (suave)",
            nutrition: {
              calories: 380,
              protein: 30,
              carbs: 45,
              fats: 10,
              sodium: 320
            }
          }
        },
        optionB: {
          category: "Papilla & Puré Suave (IDDSI 4)",
          name: "Puré de Lentejas con Pechuga Licuada",
          recipe: {
            method: "1. Cocer lentejas hasta deshacer.\n2. Licuar pechuga de pollo cocida con caldo de pollo hasta textura tersa.\n3. Añadir suplemento proteico sin sabor.\n4. Servir tibio.",
            ingredients: "150g Lentejas cocidas, 100g Pechuga de pollo, 150ml Caldo de pollo, 15g Suplemento proteico neutro",
            nutrition: {
              calories: 350,
              protein: 38,
              carbs: 40,
              fats: 8,
              sodium: 280
            }
          }
        }
      },
      {
        dayName: "Martes",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Chilaquiles Suaves con Muslo Deshebrado",
          recipe: {
            method: "1. Remojar bien las tortillas en salsa de tomate no picante.\n2. Deshebrar muslo de pollo muy finamente.\n3. Servir con queso panela rallado y crema ligera.\n4. Acompañar con frijoles refritos muy suaves.",
            ingredients: "60g Tortilla de maíz húmeda, 120g Muslo de pollo deshebrado, 150ml Salsa de tomate casera, 30g Queso Panela, 80g Frijoles refritos",
            nutrition: {
              calories: 420,
              protein: 32,
              carbs: 48,
              fats: 14,
              sodium: 360
            }
          }
        },
        optionB: {
          category: "Colación Proteica",
          name: "Smoothie de Fresa con Suplemento",
          recipe: {
            method: "1. Licuar fresas con leche Carnation.\n2. Añadir scoop de proteína o suplemento lácteo.\n3. Servir en vaso con popote para fácil ingesta.",
            ingredients: "100g Fresas, 150ml Leche Carnation, 20g Suplemento proteico",
            nutrition: {
              calories: 250,
              protein: 25,
              carbs: 30,
              fats: 6,
              sodium: 180
            }
          }
        }
      },
      {
        dayName: "Miércoles",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Chambarete de Res en Salsa Verde Dulce",
          recipe: {
            method: "1. Cocer chambarete en olla de presión hasta que se deshaga.\n2. Preparar salsa verde cocida (sin picante).\n3. Acompañar con arroz blanco muy suave y calabacitas.",
            ingredients: "150g Chambarete de Res, 100ml Salsa verde hervida, 100g Arroz blanco suave, 80g Calabaza cocida",
            nutrition: {
              calories: 450,
              protein: 35,
              carbs: 40,
              fats: 16,
              sodium: 340
            }
          }
        },
        optionB: {
          category: "Papilla & Puré Suave (IDDSI 4)",
          name: "Sopa de Fideo y Puré de Res",
          recipe: {
            method: "1. Preparar sopa de fideo tradicional muy cocida.\n2. Licuar chambarete con un poco de caldo hasta consistencia de puré grueso.\n3. Servir junto.",
            ingredients: "120g Chambarete cocido, 150g Sopa de fideo, 100ml Caldo de res magro",
            nutrition: {
              calories: 380,
              protein: 32,
              carbs: 42,
              fats: 12,
              sodium: 310
            }
          }
        }
      },
      {
        dayName: "Jueves",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Filete de Tilapia al Cilantro con Arroz",
          recipe: {
            method: "1. Cocer tilapia al vapor o empapelada para máxima suavidad.\n2. Bañar con crema de cilantro ligera.\n3. Servir con arroz blanco y zanahoria al vapor.",
            ingredients: "150g Tilapia, 50ml Crema de cilantro, 100g Arroz blanco, 80g Zanahoria al vapor",
            nutrition: {
              calories: 390,
              protein: 34,
              carbs: 45,
              fats: 9,
              sodium: 290
            }
          }
        },
        optionB: {
          category: "Colación Proteica",
          name: "Gelatina de Leche con Suplemento",
          recipe: {
            method: "1. Preparar gelatina con leche tetrapac.\n2. Disolver suplemento proteico neutro en la leche tibia antes de cuajar.\n3. Refrigerar.",
            ingredients: "15g Polvo p/ Gelatina Light, 150ml Leche Tetrapac, 15g Suplemento proteico",
            nutrition: {
              calories: 180,
              protein: 20,
              carbs: 15,
              fats: 4,
              sodium: 150
            }
          }
        }
      },
      {
        dayName: "Viernes",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Codillo de Cerdo Desmenuzado con Puré",
          recipe: {
            method: "1. Cocer codillo de cerdo muy suave y desmenuzar bien.\n2. Servir con puré de papa natural y ensalada de manzana cocida.",
            ingredients: "130g Codillo de cerdo limpio, 120g Puré de papa casero, 80g Manzana cocida",
            nutrition: {
              calories: 410,
              protein: 30,
              carbs: 40,
              fats: 15,
              sodium: 350
            }
          }
        },
        optionB: {
          category: "Papilla & Puré Suave (IDDSI 4)",
          name: "Crema de Chayote y Puré de Cerdo",
          recipe: {
            method: "1. Preparar crema de chayote suave.\n2. Procesar el codillo de cerdo con caldo hasta textura tersa.\n3. Servir tibio.",
            ingredients: "100g Codillo de cerdo, 200ml Crema de chayote, 5g Mantequilla",
            nutrition: {
              calories: 340,
              protein: 28,
              carbs: 25,
              fats: 16,
              sodium: 270
            }
          }
        }
      },
      {
        dayName: "Sábado",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Picadillo de Res Suave con Frijoles",
          recipe: {
            method: "1. Sofreír carne molida 100% res con verduras finamente picadas y cocidas.\n2. Añadir caldo de tomate para humectar abundantemente.\n3. Servir con frijoles de olla muy suaves.",
            ingredients: "120g Carne molida de res, 80g Papa y Zanahoria picada, 100ml Caldo de tomate, 100g Frijoles de olla",
            nutrition: {
              calories: 430,
              protein: 32,
              carbs: 35,
              fats: 18,
              sodium: 360
            }
          }
        },
        optionB: {
          category: "Colación Proteica",
          name: "Arroz con Leche Proteico",
          recipe: {
            method: "1. Cocer arroz con leche abundante para máxima suavidad.\n2. Disolver proteína sin sabor o vainilla en la preparación.\n3. Servir con un toque mínimo de canela.",
            ingredients: "80g Arroz cocido suave, 150ml Leche entera, 15g Suplemento de Vainilla",
            nutrition: {
              calories: 310,
              protein: 22,
              carbs: 45,
              fats: 5,
              sodium: 190
            }
          }
        }
      },
      {
        dayName: "Domingo",
        dateInfo: "Ciclo 1",
        optionA: {
          category: "Fácil Masticación",
          name: "Consomé de Pollo con Huevito Revuelto",
          recipe: {
            method: "1. Consomé casero abundante.\n2. Huevo revuelto tierno (no seco) con queso Oaxaca.\n3. Acompañar con rebanada de aguacate suave.",
            ingredients: "2pza Huevo, 30g Queso Oaxaca, 150ml Consomé de pollo, 40g Aguacate maduro",
            nutrition: {
              calories: 360,
              protein: 26,
              carbs: 5,
              fats: 26,
              sodium: 380
            }
          }
        },
        optionB: {
          category: "Cena Ligera",
          name: "Atole de Vainilla con Galletas Marías Suaves",
          recipe: {
            method: "1. Preparar atole con leche Carnation en polvo.\n2. Remojar galletas Marías en el atole para asegurar masticabilidad.\n3. Adicionar suplemento neutro.",
            ingredients: "20g Leche Carnation en Polvo, 200ml Agua, 4pza Galletas Marías, 15g Suplemento Proteico",
            nutrition: {
              calories: 280,
              protein: 18,
              carbs: 38,
              fats: 6,
              sodium: 160
            }
          }
        }
      }
    ]
  };

export const cyclicMenus = [weekOneMenu];
cyclicMenus[1] = weekOneMenu;

export const sampleParticipants = [
  {
    id: "EMP-001",
    name: "Residente Casa Nostra",
    department: "Cuidado Continuo",
    preferences: ["Menú A", "Sin Hielo"],
    restrictions: ["Alzheimer", "Dificultad Masticación"]
  }
];

export const financialStrategy = {
  monthlyBudget: 0,
  foodCostPercentage: 0,
  grossMargin: 0
};
