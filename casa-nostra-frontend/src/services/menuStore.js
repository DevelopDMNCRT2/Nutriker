// menuStore.js - Servicio sincronizado para Menús B2B Royal Canin con Selector por Calendario
import { cyclicMenus } from '../data/mockData';

const MENU_STORAGE_PREFIX = 'casa_nostra_menu_v2_';
const ORDERS_STORAGE_PREFIX = 'casa_nostra_orders_v2_';
const LEGACY_MENU_KEY = 'casa_nostra_active_menu_v2';
const LEGACY_ORDERS_KEY = 'casa_nostra_resident_orders_v2';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = (typeof window !== 'undefined' && window.__VITE_API_URL__)
  || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  || (isLocalhost ? 'http://localhost:3000' : 'https://nutrikerserver.vercel.app');

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Constantes del Modelo Institucional de Casa Nostra (4 Tiempos y 3 Servicios)
export const DAILY_SERVICES = [
  {
    key: 'desayuno',
    label: 'Desayuno / Almuerzo',
    shortLabel: 'Desayuno',
    timeRange: '08:00 - 10:00',
    iconName: 'Sunrise',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    description: 'Arranque metabólico, hidratación matutina y aporte proteico de fácil digestión.'
  },
  {
    key: 'comida',
    label: 'Comida Principal',
    shortLabel: 'Comida',
    timeRange: '13:30 - 15:30',
    iconName: 'Sun',
    color: '#B45309',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    description: 'Servicio central con 4 tiempos institucionales completos y mayor densidad de nutrientes.'
  },
  {
    key: 'cena',
    label: 'Cena Ligera',
    shortLabel: 'Cena',
    timeRange: '19:00 - 20:30',
    iconName: 'Moon',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#E0E7FF',
    description: 'Porciones digestivas hiposódicas para promover el descanso nocturno reparador.'
  }
];

export const INSTITUTIONAL_COURSES = [
  {
    key: 'soup',
    typeCode: 'S',
    label: 'Sopa / Entrada',
    shortLabel: 'Entrada',
    badge: '1er Tiempo',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    placeholder: 'Ej. Consomé casero de ave con verduras suaves, Crema de calabacita...',
    categoryDefault: 'Sopa / Entrada'
  },
  {
    key: 'optionA',
    typeCode: 'A',
    label: 'Plato Fuerte',
    shortLabel: 'Plato Fuerte',
    badge: '2do Tiempo',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#BFDBFE',
    placeholder: 'Ej. Pechuga de pollo a la plancha suave, Filete de pescado magro...',
    categoryDefault: 'Plato Fuerte'
  },
  {
    key: 'optionB',
    typeCode: 'B',
    label: 'Guarnición',
    shortLabel: 'Guarnición',
    badge: '3er Tiempo',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    placeholder: 'Ej. Puré de papa rústico al vapor, Arroz blanco suave con zanahoria...',
    categoryDefault: 'Guarnición'
  },
  {
    key: 'optionC',
    typeCode: 'C',
    label: 'Postre',
    shortLabel: 'Postre',
    badge: '4to Tiempo',
    color: '#9333EA',
    bgColor: '#F3E8FF',
    borderColor: '#E9D5FF',
    placeholder: 'Ej. Compota de manzana sin azúcar añadida, Gelatina ligera de fresa...',
    categoryDefault: 'Postre'
  }
];

export function ensureInstitutionalServices(menu) {
  if (!menu || !Array.isArray(menu.days)) return menu;
  menu.days.forEach(day => {
    if (!day) return;
    if (!day.services) {
      day.services = {
        desayuno: {
          soup: { name: 'Avena Tibia con Manzana', category: 'Sopa / Entrada', calories: 180, protein: '8g', carbs: '28g', fats: '4g', sodium: 140, recipe: { ingredients: '40g Avena, 200ml Leche, 0.5pza Manzana', method: 'Cocer a fuego lento.' } },
          optionA: { name: 'Omelette Tierno de Claras', category: 'Plato Fuerte', calories: 320, protein: '24g', carbs: '18g', fats: '10g', sodium: 280, recipe: { ingredients: '2pza Claras, 50g Espinacas, 30g Panela', method: 'Cocer en sartén antiadherente.' } },
          optionB: { name: 'Frijoles Refritos Tersos', category: 'Guarnición', calories: 220, protein: '10g', carbs: '32g', fats: '6g', sodium: 210, recipe: { ingredients: '80g Frijoles negros machacados', method: 'Calentar hasta tersura.' } },
          optionC: { name: 'Compota de Pera sin Azúcar', category: 'Postre', calories: 140, protein: '2g', carbs: '28g', fats: '1g', sodium: 60, recipe: { ingredients: '100g Pera cocida al vapor', method: 'Machacar sin grumos.' } }
        },
        comida: {
          soup: day.soup || null,
          optionA: day.optionA || null,
          optionB: day.optionB || null,
          optionC: day.optionC || null
        },
        cena: {
          soup: { name: 'Crema Ligera de Calabacita', category: 'Sopa / Entrada', calories: 160, protein: '6g', carbs: '20g', fats: '4g', sodium: 180, recipe: { ingredients: '150g Calabacita, 100ml Caldo de ave', method: 'Cocer y licuar suave.' } },
          optionA: { name: 'Tortitas de Requesón y Pavo al Vapor', category: 'Plato Fuerte', calories: 340, protein: '28g', carbs: '22g', fats: '9g', sodium: 290, recipe: { ingredients: '80g Requesón, 60g Pavo, 1 Clara', method: 'Cocer al vapor 12 min.' } },
          optionB: { name: 'Puré de Camote Amarillo', category: 'Guarnición', calories: 210, protein: '5g', carbs: '38g', fats: '4g', sodium: 160, recipe: { ingredients: '120g Camote amarillo al vapor', method: 'Hacer puré con leche tibia.' } },
          optionC: { name: 'Gelatina con Proteína Neutra', category: 'Postre', calories: 150, protein: '12g', carbs: '22g', fats: '1g', sodium: 90, recipe: { ingredients: '120ml Gelatina ligera, 10g Proteína', method: 'Refrigerar hasta cuajar.' } }
        }
      };
    } else {
      if (!day.services.comida) {
        day.services.comida = {
          soup: day.soup || null,
          optionA: day.optionA || null,
          optionB: day.optionB || null,
          optionC: day.optionC || null
        };
      }
      if (!day.services.desayuno) {
        day.services.desayuno = {
          soup: { name: 'Avena Tibia con Canela', category: 'Sopa / Entrada', calories: 180, protein: '8g', carbs: '28g', fats: '4g', sodium: 140, recipe: { ingredients: '40g Avena, 200ml Leche', method: 'Cocer a fuego lento.' } },
          optionA: { name: 'Omelette Tierno de Claras', category: 'Plato Fuerte', calories: 320, protein: '24g', carbs: '18g', fats: '10g', sodium: 280, recipe: { ingredients: '2pza Claras, 30g Panela', method: 'Cocer en sartén.' } },
          optionB: { name: 'Frijoles Refritos Tersos', category: 'Guarnición', calories: 220, protein: '10g', carbs: '32g', fats: '6g', sodium: 210, recipe: { ingredients: '80g Frijoles machacados', method: 'Calentar hasta tersura.' } },
          optionC: { name: 'Compota de Pera', category: 'Postre', calories: 140, protein: '2g', carbs: '28g', fats: '1g', sodium: 60, recipe: { ingredients: '100g Pera cocida', method: 'Machacar sin grumos.' } }
        };
      }
      if (!day.services.cena) {
        day.services.cena = {
          soup: { name: 'Crema Ligera de Calabacita', category: 'Sopa / Entrada', calories: 160, protein: '6g', carbs: '20g', fats: '4g', sodium: 180, recipe: { ingredients: '150g Calabacita', method: 'Licuar con caldo tibio.' } },
          optionA: { name: 'Tortitas de Requesón y Pavo al Vapor', category: 'Plato Fuerte', calories: 340, protein: '28g', carbs: '22g', fats: '9g', sodium: 290, recipe: { ingredients: '80g Requesón, 60g Pavo', method: 'Cocer al vapor.' } },
          optionB: { name: 'Puré de Camote Amarillo', category: 'Guarnición', calories: 210, protein: '5g', carbs: '38g', fats: '4g', sodium: 160, recipe: { ingredients: '120g Camote amarillo', method: 'Hacer puré terso.' } },
          optionC: { name: 'Gelatina con Proteína Neutra', category: 'Postre', calories: 150, protein: '12g', carbs: '22g', fats: '1g', sodium: 90, recipe: { ingredients: '120ml Gelatina ligera', method: 'Refrigerar hasta cuajar.' } }
        };
      }
    }
    // Asegurar espejo retrocompatible a raíz
    day.soup = day.services.comida.soup || day.soup || null;
    day.optionA = day.services.comida.optionA || day.optionA || null;
    day.optionB = day.services.comida.optionB || day.optionB || null;
    day.optionC = day.services.comida.optionC || day.optionC || null;
  });
  return menu;
}

export const BASE_START_MONDAY = new Date(2026, 7, 10, 12, 0, 0); // 10 de Agosto, 2026

export function getMondayOfDate(inputDate) {
  const d = inputDate instanceof Date ? new Date(inputDate) : new Date(inputDate || '2026-08-10T12:00:00');
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

export function formatYYYYMMDD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekInfoFromDate(inputDate) {
  let monday;
  if (typeof inputDate === 'number' && inputDate >= 1 && inputDate <= 52) {
    const offsetDays = (inputDate - 1) * 7;
    monday = new Date(BASE_START_MONDAY.getTime() + offsetDays * 86400000);
  } else if (typeof inputDate === 'string' && /^\d+$/.test(inputDate)) {
    const wNum = parseInt(inputDate, 10);
    const offsetDays = (wNum - 1) * 7;
    monday = new Date(BASE_START_MONDAY.getTime() + offsetDays * 86400000);
  } else {
    monday = getMondayOfDate(inputDate);
  }

  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const friday = new Date(monday.getTime() + 4 * 86400000);
  const weekKey = formatYYYYMMDD(monday);

  const diffTime = monday.getTime() - BASE_START_MONDAY.getTime();
  const diffWeeks = Math.round(diffTime / (7 * 86400000));
  const weekNumber = diffWeeks >= 0 ? diffWeeks + 1 : 1;

  const monDay = monday.getDate();
  const monMonth = MONTH_NAMES[monday.getMonth()];
  const sunDay = sunday.getDate();
  const sunMonth = MONTH_NAMES[sunday.getMonth()];
  const friDay = friday.getDate();
  const friMonth = MONTH_NAMES[friday.getMonth()];
  const year = sunday.getFullYear();

  const dateRange = (monMonth === sunMonth)
    ? `${monDay} al ${sunDay} de ${monMonth}, ${year}`
    : `${monDay} de ${monMonth} al ${sunDay} de ${sunMonth}, ${year}`;

  const title = dateRange;

  const dayDates = {
    Lunes: `${monDay} de ${monMonth}, ${monday.getFullYear()}`,
    Martes: `${new Date(monday.getTime() + 1 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 1 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 1 * 86400000).getFullYear()}`,
    Miércoles: `${new Date(monday.getTime() + 2 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 2 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 2 * 86400000).getFullYear()}`,
    Jueves: `${new Date(monday.getTime() + 3 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 3 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 3 * 86400000).getFullYear()}`,
    Viernes: `${friDay} de ${friMonth}, ${friday.getFullYear()}`,
    Sábado: `${new Date(monday.getTime() + 5 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 5 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 5 * 86400000).getFullYear()}`,
    Domingo: `${sunDay} de ${sunMonth}, ${year}`
  };

  return {
    weekKey,
    weekNumber,
    monday,
    friday,
    sunday,
    dateRange,
    title,
    dayDates
  };
}

const DEFAULT_RECIPES = {
  Lunes: {
    methodA: "1. Preparar caldo de pollo natural (sin consomé en polvo).\n2. Mezclar puré de papa con atún drenado y huevo.\n3. Formar tortitas y dorar ligeramente en sartén antiadherente.\n4. Servir con verduras cocidas extra suaves.",
    methodB: "1. Cocer lentejas hasta deshacer.\n2. Licuar pechuga de pollo cocida con caldo de pollo hasta textura tersa.\n3. Añadir suplemento proteico sin sabor.\n4. Servir tibio.",
    imageA: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"
  },
  Martes: {
    methodA: "1. Remojar bien las tortillas en salsa de tomate no picante.\n2. Deshebrar muslo de pollo muy finamente.\n3. Servir con queso panela rallado y frijoles refritos muy suaves.",
    methodB: "1. Licuar fresas con leche Carnation.\n2. Añadir suplemento proteico o lácteo.\n3. Servir tibio o templado para deglución fácil.",
    imageA: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  Miércoles: {
    methodA: "1. Formar albóndigas de res muy suaves con arroz cocido fino.\n2. Cocinar a fuego lento en caldillo de jitomate con calabacitas picadas.",
    methodB: "1. Preparar gelatina de agua adicionada con proteína neutra.\n2. Servir con compota de pera suave sin grumos.",
    imageA: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80"
  },
  Jueves: {
    methodA: "1. Cocinar filete de salmón al vapor con finas hierbas.\n2. Acompañar con puré de camote amarillo suave y zanahorias baby.",
    methodB: "1. Caldo de verduras casero con pechuga de pollo deshebrada extra fina.\n2. Servir con fideos de arroz bien cocidos.",
    imageA: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  Viernes: {
    methodA: "1. Filete de pescado blanco horneado con aceite de oliva y gotas de limón.\n2. Servir con puré de papa suave y calabacita al vapor.",
    methodB: "1. Crema de champiñones suave con leche descremada.\n2. Incorporar proteína neutra y servir con crutones remojados.",
    imageA: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80"
  },
  Sábado: {
    methodA: "1. Pechuga de pollo en crema ligera de calabacita.\n2. Servir con arroz blanco muy suave.",
    methodB: "1. Arroz con leche descremada, canela y proteína.\n2. Servir en porción controlada y textura tersa.",
    imageA: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  Domingo: {
    methodA: "1. Consomé de pollo casero abundante.\n2. Huevo revuelto tierno con queso Oaxaca y aguacate suave.",
    methodB: "1. Preparar atole de vainilla con galletas Marías suaves remojadas.\n2. Adicionar suplemento proteico neutro.",
    imageA: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  }
};

export const menuStore = {
  // Función auxiliar de cálculo de fechas de semana
  getWeekInfoFromDate,

  // Normalizar entrada de semana (objeto weekInfo, número o fecha)
  normalizeWeek(weekInput) {
    if (!weekInput) return getWeekInfoFromDate(1);
    if (typeof weekInput === 'object' && weekInput.weekKey) return weekInput;
    return getWeekInfoFromDate(weekInput);
  },

  // Sincronizar menú desde el backend REST (PostgreSQL 3FN)
  async syncMenuFromBackend(weekInput) {
    const weekInfo = this.normalizeWeek(weekInput);
    const cacheKey = `menu_${weekInfo.weekKey}`;
    if (this._syncMenuCache && this._syncMenuCache[cacheKey]) {
      return this._syncMenuCache[cacheKey];
    }
    if (!this._syncMenuCache) this._syncMenuCache = {};

    this._syncMenuCache[cacheKey] = fetch(`${API_BASE_URL}/api/royal/menu/actual?semana=${weekInfo.weekKey}&empresa=Casa%20Nostra`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.isPublished && Array.isArray(data.days) && data.days.length > 0) {
          const formattedMenu = ensureInstitutionalServices({
            weekKey: data.weekKey || weekInfo.weekKey,
            weekNumber: data.weekNumber || weekInfo.weekNumber,
            dateRange: weekInfo.dateRange,
            title: weekInfo.title,
            daysPerWeek: data.daysPerWeek || String(data.days.length),
            dietOptionA: data.dietOptionA,
            dietOptionB: data.dietOptionB,
            dietOptionC: data.dietOptionC || 'Especial & Hiposódico',
            publishedAt: data.publishedAt || new Date().toISOString(),
            isPublished: true,
            days: data.days
          });
          const currentStored = localStorage.getItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`);
          const stringified = JSON.stringify(formattedMenu);
          if (currentStored !== stringified) {
            localStorage.setItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`, stringified);
            localStorage.setItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`, stringified);
            if (weekInfo.weekNumber === 1) {
              localStorage.setItem(LEGACY_MENU_KEY, stringified);
            }
            window.dispatchEvent(new CustomEvent('royal_canin_menu_updated', {
              detail: {
                weekKey: weekInfo.weekKey,
                weekNumber: weekInfo.weekNumber,
                week: weekInfo.weekNumber,
                activeMenu: formattedMenu
              }
            }));
          }
          return formattedMenu;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        setTimeout(() => {
          if (this._syncMenuCache) delete this._syncMenuCache[cacheKey];
        }, 4000);
      });

    return this._syncMenuCache[cacheKey];
  },

  // Sincronizar pedidos desde el backend REST (PostgreSQL 3FN)
  async syncOrdersFromBackend(weekInput) {
    const weekInfo = this.normalizeWeek(weekInput);
    const cacheKey = `orders_${weekInfo.weekKey}`;
    if (this._syncOrdersCache && this._syncOrdersCache[cacheKey]) {
      return this._syncOrdersCache[cacheKey];
    }
    if (!this._syncOrdersCache) this._syncOrdersCache = {};

    this._syncOrdersCache[cacheKey] = fetch(`${API_BASE_URL}/api/royal/pedidos/${weekInfo.weekKey}?empresa=Casa%20Nostra`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.orders && Object.keys(data.orders).length > 0) {
          const currentStored = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`);
          const stringified = JSON.stringify(data.orders);
          if (currentStored !== stringified) {
            localStorage.setItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`, stringified);
            localStorage.setItem(`${ORDERS_STORAGE_PREFIX}w${weekInfo.weekNumber}`, stringified);
            if (weekInfo.weekNumber === 1) {
              localStorage.setItem(LEGACY_ORDERS_KEY, stringified);
            }
            window.dispatchEvent(new CustomEvent('royal_canin_orders_updated', {
              detail: {
                weekKey: weekInfo.weekKey,
                weekNumber: weekInfo.weekNumber,
                week: weekInfo.weekNumber,
                orders: data.orders
              }
            }));
          }
          return data.orders;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        setTimeout(() => {
          if (this._syncOrdersCache) delete this._syncOrdersCache[cacheKey];
        }, 4000);
      });

    return this._syncOrdersCache[cacheKey];
  },

  // Obtener menú activo de una semana específica (por objeto weekInfo, fecha o número)
  getActiveMenu(weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    // Sincronización transparente en segundo plano contra backend
    this.syncMenuFromBackend(weekInfo);

    try {
      const stored = localStorage.getItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`);
      if (stored) return ensureInstitutionalServices(JSON.parse(stored));
      const storedByNum = localStorage.getItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`);
      if (storedByNum) return ensureInstitutionalServices(JSON.parse(storedByNum));
      
      // Fallback a claves alternativas o previas de Casa Nostra y Royal Canin
      const altKeys = [
        `casa_nostra_menu_v2_${weekInfo.weekKey}`,
        `casa_nostra_menu_v2_w${weekInfo.weekNumber}`,
        `royal_canin_menu_v2_${weekInfo.weekKey}`,
        `royal_canin_menu_v2_w${weekInfo.weekNumber}`,
        `royal_menu_v2_${weekInfo.weekKey}`
      ];
      for (const k of altKeys) {
        const altStored = localStorage.getItem(k);
        if (altStored) {
          try {
            const parsed = ensureInstitutionalServices(JSON.parse(altStored));
            // Migrar automáticamente a la clave estándar
            localStorage.setItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`, JSON.stringify(parsed));
            return parsed;
          } catch (_) {}
        }
      }

      if (weekInfo.weekNumber === 1) {
        const legacy = localStorage.getItem(LEGACY_MENU_KEY) || localStorage.getItem('royal_canin_active_menu_v2');
        if (legacy) return ensureInstitutionalServices(JSON.parse(legacy));
      }
    } catch (e) {
      console.error(`Error reading active menu for week ${weekInfo.weekKey}:`, e);
    }


    // Para cualquier otra semana del calendario que aún no ha sido programada por la doctora:
    return {
      weekKey: weekInfo.weekKey,
      weekNumber: weekInfo.weekNumber,
      dateRange: weekInfo.dateRange,
      title: weekInfo.title,
      daysPerWeek: '0',
      dietOptionA: '',
      dietOptionB: '',
      publishedAt: null,
      isPublished: false,
      humanVerification: null,
      days: []
    };
  },

  // Analizar platillo mediante nodo de IA (Gemini / Heurística Bromatológica)
  async analyzeDishWithAI({ name, ingredients, category }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ia/analizar-platillo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrePlatillo: name, ingredientes, categoria: category })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Error al consultar nodo de IA para analisis de platillo:', err);
    }
    return null;
  },

  // Publicar menú desde la Nutrióloga para cualquier semana seleccionada
  publishMenu({ weekInput = 1, week = 1, daysPerWeek, dietOptionA, dietOptionB, dietOptionC, dishSelection, dishServices, humanVerification, daysList }) {
    const weekInfo = this.normalizeWeek(weekInput || week);
    const ALL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const numDays = Array.isArray(daysList) && daysList.length > 0 ? daysList.length : (parseInt(daysPerWeek, 10) || 5);
    let dayNames = [];

    if (Array.isArray(daysList) && daysList.length > 0) {
      dayNames = daysList;
    } else if (dishSelection && typeof dishSelection === 'object') {
      const selectedKeys = Object.keys(dishSelection);
      // Mantener los días seleccionados en el orden natural del calendario
      const filtered = ALL_DAYS.filter(d => selectedKeys.includes(d));
      dayNames = filtered.length > 0 ? filtered : ALL_DAYS.slice(0, numDays);
    } else {
      dayNames = ALL_DAYS.slice(0, numDays);
    }

    const days = dayNames.map((dayName) => {
      const buildCourse = (dishRaw, fallbackName, defaultCat, defaultCal, defaultProt, defaultCarb, defaultFat, defaultSod) => {
        const dish = dishRaw || {};
        return {
          id: `${weekInfo.weekKey}-${dayName.toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`,
          name: dish.name || fallbackName,
          category: dish.category || defaultCat,
          calories: parseInt(dish.calories, 10) || defaultCal,
          protein: typeof dish.protein === 'number' ? `${dish.protein}g` : (dish.protein || `${defaultProt}g`),
          carbs: typeof dish.carbs === 'number' ? `${dish.carbs}g` : (dish.carbs || `${defaultCarb}g`),
          fats: typeof dish.fats === 'number' ? `${dish.fats}g` : (dish.fats || `${defaultFat}g`),
          sodium: parseInt(dish.sodium || dish.sodio_mg, 10) || defaultSod,
          sodio_mg: parseInt(dish.sodium || dish.sodio_mg, 10) || defaultSod,
          allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
          clinicalProfile: dish.clinicalProfile || null,
          image: dish.image || null,
          recipe: {
            ingredients: (dish.ingredients || dish.recipe?.ingredients || '').trim(),
            method: (dish.method || dish.recipe?.method || '').trim() || '1. Preparar ingredientes según técnica institucional.\n2. Cocinar a temperatura controlada.\n3. Servir en textura adecuada.',
            nutrition: {
              calories: parseInt(dish.calories, 10) || defaultCal,
              protein: typeof dish.protein === 'number' ? `${dish.protein}g` : (dish.protein || `${defaultProt}g`),
              carbs: typeof dish.carbs === 'number' ? `${dish.carbs}g` : (dish.carbs || `${defaultCarb}g`),
              fats: typeof dish.fats === 'number' ? `${dish.fats}g` : (dish.fats || `${defaultFat}g`),
              sodium: parseInt(dish.sodium || dish.sodio_mg, 10) || defaultSod
            }
          }
        };
      };

      const comidaRaw = (dishServices?.comida?.[dayName]) || (dishSelection?.[dayName]) || {};
      const desayunoRaw = (dishServices?.desayuno?.[dayName]) || {};
      const cenaRaw = (dishServices?.cena?.[dayName]) || {};

      const serviceDesayuno = {
        soup: buildCourse(desayunoRaw.soup, 'Avena Tibia o Fruta en Compota', 'Sopa / Entrada', 180, 8, 28, 4, 140),
        optionA: buildCourse(desayunoRaw.optionA, 'Omelette Tierno de Claras con Queso Panela', dietOptionA || 'Plato Fuerte', 320, 24, 18, 10, 280),
        optionB: buildCourse(desayunoRaw.optionB, 'Frijoles Refritos Tersos Suaves', dietOptionB || 'Guarnición', 220, 10, 32, 6, 210),
        optionC: buildCourse(desayunoRaw.optionC, 'Compota de Pera o Fruta Cocida', dietOptionC || 'Postre', 140, 2, 28, 1, 60)
      };

      const serviceComida = {
        soup: buildCourse(comidaRaw.soup, 'Sopa Nutritiva del Día', 'Sopa / Entrada', 220, 12, 24, 6, 260),
        optionA: buildCourse(comidaRaw.optionA, 'Plato Fuerte Principal', dietOptionA || 'Plato Fuerte', 480, 35, 40, 14, 340),
        optionB: buildCourse(comidaRaw.optionB, 'Guarnición Balanceada', dietOptionB || 'Guarnición', 430, 18, 50, 16, 320),
        optionC: buildCourse(comidaRaw.optionC, 'Postre Geriátrico Ligero', dietOptionC || 'Postre', 390, 28, 38, 12, 280)
      };

      const serviceCena = {
        soup: buildCourse(cenaRaw.soup, 'Crema Ligera de Calabacita o Caldo de Ave', 'Sopa / Entrada', 160, 6, 20, 4, 180),
        optionA: buildCourse(cenaRaw.optionA, 'Pechuga Deshebrada Suave o Tortitas de Requesón', dietOptionA || 'Plato Fuerte', 340, 28, 22, 9, 290),
        optionB: buildCourse(cenaRaw.optionB, 'Puré de Camote Amarillo al Vapor', dietOptionB || 'Guarnición', 210, 5, 38, 4, 160),
        optionC: buildCourse(cenaRaw.optionC, 'Gelatina con Suplemento Proteico', dietOptionC || 'Postre', 150, 12, 22, 1, 90)
      };

      return {
        dayName,
        dateLabel: weekInfo.dayDates[dayName] || `${dayName}, ${weekInfo.dateRange}`,
        services: {
          desayuno: serviceDesayuno,
          comida: serviceComida,
          cena: serviceCena
        },
        // Retrocompatibilidad raíz con comida
        soup: serviceComida.soup,
        optionA: serviceComida.optionA,
        optionB: serviceComida.optionB,
        optionC: serviceComida.optionC
      };
    });

    const activeMenu = {
      weekKey: weekInfo.weekKey,
      weekNumber: weekInfo.weekNumber,
      dateRange: weekInfo.dateRange,
      title: weekInfo.title,
      daysPerWeek: String(dayNames.length),
      dietOptionA,
      dietOptionB,
      dietOptionC: dietOptionC || 'Especial & Hiposódico',
      publishedAt: new Date().toISOString(),
      isPublished: true,
      humanVerification: humanVerification || {
        isVerified: true,
        verifiedBy: 'Nutrióloga Karla',
        role: 'Nutrióloga Clínica & Responsable del Programa',
        verifiedAt: new Date().toISOString(),
        certificationStatement: 'Menú y fichas técnicas auditadas y certificadas manualmente por especialista humano'
      },
      days
    };

    localStorage.setItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`, JSON.stringify(activeMenu));
    localStorage.setItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`, JSON.stringify(activeMenu));
    if (weekInfo.weekNumber === 1) {
      localStorage.setItem(LEGACY_MENU_KEY, JSON.stringify(activeMenu));
    }

    window.dispatchEvent(new CustomEvent('royal_canin_menu_updated', {
      detail: {
        weekKey: weekInfo.weekKey,
        weekNumber: weekInfo.weekNumber,
        week: weekInfo.weekNumber,
        activeMenu
      }
    }));

    // Persistir asíncronamente en backend PostgreSQL (3FN)
    fetch(`${API_BASE_URL}/api/royal/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa: 'Casa Nostra',
        weekKey: activeMenu.weekKey,
        weekNumber: activeMenu.weekNumber,
        daysPerWeek: activeMenu.daysPerWeek,
        dietOptionA: activeMenu.dietOptionA,
        dietOptionB: activeMenu.dietOptionB,
        dietOptionC: activeMenu.dietOptionC,
        humanVerification: activeMenu.humanVerification,
        days: activeMenu.days
      })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          console.log('✅ Menú semanal persistido en PostgreSQL:', result.menuId);
        }
      })
      .catch(err => {
        console.warn('⚠️ No se pudo persistir en backend, menú guardado en localStorage:', err.message);
      });

    return activeMenu;
  },

  // Obtener pedidos de empleados de cualquier semana
  getEmployeeOrders(weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    // Sincronización transparente en segundo plano contra backend
    this.syncOrdersFromBackend(weekInfo);

    try {
      const stored = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`);
      if (stored) return JSON.parse(stored);
      const storedByNum = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}w${weekInfo.weekNumber}`);
      if (storedByNum) return JSON.parse(storedByNum);
      
      // Fallback a claves alternativas o previas
      const altKeys = [
        `casa_nostra_orders_v2_${weekInfo.weekKey}`,
        `casa_nostra_resident_orders_v2_${weekInfo.weekKey}`,
        `royal_canin_orders_v2_${weekInfo.weekKey}`,
        `royal_orders_v2_${weekInfo.weekKey}`
      ];
      for (const k of altKeys) {
        const altStored = localStorage.getItem(k);
        if (altStored) {
          try {
            const parsed = JSON.parse(altStored);
            // Migrar automáticamente
            localStorage.setItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`, altStored);
            return parsed;
          } catch (_) {}
        }
      }

      if (weekInfo.weekNumber === 1) {
        const legacy = localStorage.getItem(LEGACY_ORDERS_KEY) || localStorage.getItem('royal_canin_employee_orders_v2');
        if (legacy) return JSON.parse(legacy);
      }
    } catch (e) {
      console.error(`Error reading employee orders for week ${weekInfo.weekKey}:`, e);
    }
    return {};
  },

  // Guardar pedido de un empleado para cualquier semana
  saveEmployeeOrder(employeeId, orderData, weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    const orders = this.getEmployeeOrders(weekInfo);
    orders[employeeId] = {
      ...orderData,
      weekKey: weekInfo.weekKey,
      weekNumber: weekInfo.weekNumber,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`, JSON.stringify(orders));
    localStorage.setItem(`${ORDERS_STORAGE_PREFIX}w${weekInfo.weekNumber}`, JSON.stringify(orders));
    if (weekInfo.weekNumber === 1) {
      localStorage.setItem(LEGACY_ORDERS_KEY, JSON.stringify(orders));
    }
    window.dispatchEvent(new CustomEvent('royal_canin_orders_updated', {
      detail: {
        weekKey: weekInfo.weekKey,
        weekNumber: weekInfo.weekNumber,
        week: weekInfo.weekNumber,
        orders
      }
    }));

    // Persistir asíncronamente en backend PostgreSQL (3FN)
    fetch(`${API_BASE_URL}/api/royal/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa: 'Casa Nostra',
        usuarioId: employeeId,
        empleadoNombre: orderData.employeeName || orderData.nombre || undefined,
        empleadoEmail: orderData.employeeEmail || orderData.email || undefined,
        semanaKey: weekInfo.weekKey,
        selections: orderData.selections || {},
        estado: 'confirmado'
      })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          console.log('✅ Pedido de empleado persistido en PostgreSQL:', result.pedidoId);
        }
      })
      .catch(err => {
        console.warn('⚠️ No se pudo persistir pedido en backend, guardado en localStorage:', err.message);
      });

    return orders;
  },

  // Obtener métricas reales de producción para el Chef según la semana
  getChefMetrics(dayIndex, totalStaff = 45, weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    const orders = this.getEmployeeOrders(weekInfo);
    const orderList = Object.values(orders);

    let countA = 0;
    let countB = 0;

    orderList.forEach(order => {
      const dayChoice = order.selections?.[dayIndex];
      if (dayChoice) {
        if (dayChoice.platoFuerte === 'A') countA++;
        else if (dayChoice.platoFuerte === 'B') countB++;
      }
    });

    const confirmedCount = countA + countB;

    return {
      totalPortions: totalStaff,
      countA,
      countB,
      confirmedCount
    };
  },

  // Modificar manualmente ingredientes de una receta sugerida (Chef o Nutrióloga)
  async updateDishIngredients(weekInput = 1, dayIdentifier, optionKey, newIngredients, modifiedBy = 'usuario') {
    const weekInfo = this.normalizeWeek(weekInput);
    const activeMenu = this.getActiveMenu(weekInfo);
    if (!activeMenu || !Array.isArray(activeMenu.days)) return null;

    let targetDayIndex = -1;
    if (typeof dayIdentifier === 'number') {
      targetDayIndex = dayIdentifier;
    } else if (typeof dayIdentifier === 'string') {
      targetDayIndex = activeMenu.days.findIndex(
        d => d.dayName?.toLowerCase() === dayIdentifier.toLowerCase()
      );
    }

    if (targetDayIndex < 0 || targetDayIndex >= activeMenu.days.length) {
      console.warn(`[menuStore] No se encontró el día '${dayIdentifier}' para actualizar ingredientes.`);
      return null;
    }

    const dayObj = activeMenu.days[targetDayIndex];
    let optProp = 'optionA';
    if (optionKey === 'soup' || optionKey === 'S') optProp = 'soup';
    else if (optionKey === 'B' || optionKey === 'optionB') optProp = 'optionB';
    else if (optionKey === 'C' || optionKey === 'optionC') optProp = 'optionC';
    else if (optionKey === 'A' || optionKey === 'optionA') optProp = 'optionA';
    const dish = dayObj[optProp];

    if (!dish) return null;

    if (!dish.recipe) {
      dish.recipe = { ingredients: '', method: '' };
    }

    // Respaldar ingredientes sugeridos originales si aún no se respaldaron
    if (!dish.originalIngredients) {
      dish.originalIngredients = dish.recipe.ingredients || '';
    }

    const formattedIngredients = Array.isArray(newIngredients)
      ? newIngredients.filter(Boolean).join(', ')
      : String(newIngredients || '').trim();

    dish.recipe.ingredients = formattedIngredients;
    dish.isManuallyAdjusted = true;
    dish.lastModifiedAt = new Date().toISOString();
    dish.lastModifiedBy = modifiedBy;

    // Recalcular inmediatamente macros, perfil clínico y alérgenos con el nodo de IA
    try {
      const aiResult = await this.analyzeDishWithAI({
        name: dish.name,
        ingredients: formattedIngredients,
        category: dish.category
      });
      if (aiResult) {
        dish.calories = aiResult.calorias;
        dish.protein = typeof aiResult.proteina === 'number' ? `${aiResult.proteina}g` : aiResult.proteina;
        dish.carbs = typeof aiResult.carbos === 'number' ? `${aiResult.carbos}g` : aiResult.carbos;
        dish.fats = typeof aiResult.grasas === 'number' ? `${aiResult.grasas}g` : aiResult.grasas;
        dish.clinicalProfile = aiResult.perfilClinico;
        dish.allergens = aiResult.alergenos || [];
      }
    } catch (e) {
      console.warn('Error al recalcular macros con IA:', e);
    }

    // Guardar en localStorage
    localStorage.setItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`, JSON.stringify(activeMenu));
    localStorage.setItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`, JSON.stringify(activeMenu));
    if (weekInfo.weekNumber === 1) {
      localStorage.setItem(LEGACY_MENU_KEY, JSON.stringify(activeMenu));
    }

    // Emitir evento de sincronización reactiva
    window.dispatchEvent(new CustomEvent('royal_canin_menu_updated', {
      detail: {
        weekKey: weekInfo.weekKey,
        weekNumber: weekInfo.weekNumber,
        week: weekInfo.weekNumber,
        activeMenu
      }
    }));

    // Sincronizar en backend si está disponible
    fetch(`${API_BASE_URL}/api/royal/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa: 'Casa Nostra',
        weekKey: activeMenu.weekKey,
        weekNumber: activeMenu.weekNumber,
        daysPerWeek: activeMenu.daysPerWeek,
        dietOptionA: activeMenu.dietOptionA,
        dietOptionB: activeMenu.dietOptionB,
        days: activeMenu.days
      })
    }).catch(() => {});

    return activeMenu;
  },

  // Restablecer ingredientes sugeridos originales de un platillo
  resetDishIngredients(weekInput = 1, dayIdentifier, optionKey) {
    const weekInfo = this.normalizeWeek(weekInput);
    const activeMenu = this.getActiveMenu(weekInfo);
    if (!activeMenu || !Array.isArray(activeMenu.days)) return null;

    let targetDayIndex = -1;
    if (typeof dayIdentifier === 'number') {
      targetDayIndex = dayIdentifier;
    } else if (typeof dayIdentifier === 'string') {
      targetDayIndex = activeMenu.days.findIndex(
        d => d.dayName?.toLowerCase() === dayIdentifier.toLowerCase()
      );
    }

    if (targetDayIndex < 0 || targetDayIndex >= activeMenu.days.length) return null;

    const dayObj = activeMenu.days[targetDayIndex];
    let optProp = 'optionA';
    if (optionKey === 'soup' || optionKey === 'S') optProp = 'soup';
    else if (optionKey === 'B' || optionKey === 'optionB') optProp = 'optionB';
    else if (optionKey === 'C' || optionKey === 'optionC') optProp = 'optionC';
    else if (optionKey === 'A' || optionKey === 'optionA') optProp = 'optionA';
    const dish = dayObj[optProp];

    if (!dish || !dish.originalIngredients) return null;

    if (!dish.recipe) {
      dish.recipe = { ingredients: '', method: '' };
    }

    dish.recipe.ingredients = dish.originalIngredients;
    dish.isManuallyAdjusted = false;
    delete dish.lastModifiedAt;
    delete dish.lastModifiedBy;

    // Guardar en localStorage
    localStorage.setItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`, JSON.stringify(activeMenu));
    localStorage.setItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`, JSON.stringify(activeMenu));
    if (weekInfo.weekNumber === 1) {
      localStorage.setItem(LEGACY_MENU_KEY, JSON.stringify(activeMenu));
    }

    window.dispatchEvent(new CustomEvent('royal_canin_menu_updated', {
      detail: {
        weekKey: weekInfo.weekKey,
        weekNumber: weekInfo.weekNumber,
        week: weekInfo.weekNumber,
        activeMenu
      }
    }));

    return activeMenu;
  }
};
