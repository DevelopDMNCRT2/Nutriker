// menuStore.js - Servicio sincronizado para Menús B2B Royal Canin con Selector por Calendario
import { cyclicMenus } from '../data/mockData';

const MENU_STORAGE_PREFIX = 'royal_canin_menu_';
const ORDERS_STORAGE_PREFIX = 'royal_canin_orders_';
const LEGACY_MENU_KEY = 'royal_canin_active_menu';
const LEGACY_ORDERS_KEY = 'royal_canin_employee_orders';

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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

  const friday = new Date(monday.getTime() + 4 * 86400000);
  const weekKey = formatYYYYMMDD(monday);

  const diffTime = monday.getTime() - BASE_START_MONDAY.getTime();
  const diffWeeks = Math.round(diffTime / (7 * 86400000));
  const weekNumber = diffWeeks >= 0 ? diffWeeks + 1 : 1;

  const monDay = monday.getDate();
  const monMonth = MONTH_NAMES[monday.getMonth()];
  const friDay = friday.getDate();
  const friMonth = MONTH_NAMES[friday.getMonth()];
  const year = friday.getFullYear();

  const dateRange = (monMonth === friMonth)
    ? `${monDay} al ${friDay} de ${monMonth}, ${year}`
    : `${monDay} de ${monMonth} al ${friDay} de ${friMonth}, ${year}`;

  const title = dateRange;

  const dayDates = {
    Lunes: `${monDay} de ${monMonth}, ${monday.getFullYear()}`,
    Martes: `${new Date(monday.getTime() + 1 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 1 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 1 * 86400000).getFullYear()}`,
    Miércoles: `${new Date(monday.getTime() + 2 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 2 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 2 * 86400000).getFullYear()}`,
    Jueves: `${new Date(monday.getTime() + 3 * 86400000).getDate()} de ${MONTH_NAMES[new Date(monday.getTime() + 3 * 86400000).getMonth()]}, ${new Date(monday.getTime() + 3 * 86400000).getFullYear()}`,
    Viernes: `${friDay} de ${friMonth}, ${friday.getFullYear()}`
  };

  return {
    weekKey,
    weekNumber,
    monday,
    friday,
    dateRange,
    title,
    dayDates
  };
}

const DEFAULT_RECIPES = {
  Lunes: {
    methodA: "1. Macerar pechuga con romero y limón.\n2. Cocinar a la plancha a 180°C por 6 mins por lado.\n3. Servir con quinoa tricolor y calabacitas asadas.",
    methodB: "1. Rostizar garbanzos con paprika a 200°C por 15 mins.\n2. Saltear vegetales mixtos al dente.\n3. Servir con cama de arroz y aderezo artesanal.",
    imageA: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  Martes: {
    methodA: "1. Sellar filete de salmón en sartén caliente con miel de mostaza.\n2. Hornear camote en cubos y espárragos al vapor.",
    methodB: "1. Cocer lentejas con curry y especias.\n2. Incorporar leche de coco y espinacas frescas.\n3. Servir con cuscús perlado.",
    imageA: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  Miércoles: {
    methodA: "1. Sellar medallón a término deseado con sal en grano.\n2. Preparar puré rústico de coliflor con mantequilla clarificada y brócoli.",
    methodB: "1. Prensar y marinar tofu en cubos con salsa soya baja en sodio.\n2. Saltear con fideos de arroz, pimientos y aceite de ajonjolí.",
    imageA: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80"
  },
  Jueves: {
    methodA: "1. Saltear fajitas de pollo con trilogía de pimientos y cebolla morada.\n2. Servir con tortillas de maíz recién hechas.",
    methodB: "1. Estofar frijol negro con quinoa y especias mexicanas.\n2. Acompañar con guacamole fresco y jitomate picado.",
    imageA: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  Viernes: {
    methodA: "1. Envolver filete de pescado en papel pergamino con julianas de vegetales y aceite de oliva.\n2. Hornear a 190°C por 14 minutos.",
    methodB: "1. Formar medallón artesanal de portobello y lentejas.\n2. Sellar a la plancha y montar con pan de centeno, arúgula y tahini.",
    imageA: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    imageB: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80"
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

  // Obtener menú activo de una semana específica (por objeto weekInfo, fecha o número)
  getActiveMenu(weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    try {
      const stored = localStorage.getItem(`${MENU_STORAGE_PREFIX}${weekInfo.weekKey}`);
      if (stored) return JSON.parse(stored);
      const storedByNum = localStorage.getItem(`${MENU_STORAGE_PREFIX}w${weekInfo.weekNumber}`);
      if (storedByNum) return JSON.parse(storedByNum);
      if (weekInfo.weekNumber === 1) {
        const legacy = localStorage.getItem(LEGACY_MENU_KEY);
        if (legacy) return JSON.parse(legacy);
      }
    } catch (e) {
      console.error(`Error reading active menu for week ${weekInfo.weekKey}:`, e);
    }

    // Únicamente la Semana 1 inicial cuenta con menú pre-cargado para la operación activa.
    if (weekInfo.weekNumber === 1 || weekInfo.weekKey === '2026-08-10') {
      const initialWeek = cyclicMenus[0];
      const initialDays = (initialWeek.days || []).map(day => ({
        ...day,
        dateLabel: weekInfo.dayDates[day.dayName] || day.dateLabel
      }));

      return {
        weekKey: weekInfo.weekKey,
        weekNumber: weekInfo.weekNumber,
        dateRange: weekInfo.dateRange,
        title: weekInfo.title,
        daysPerWeek: '3',
        dietOptionA: 'Balance Proteico',
        dietOptionB: 'Plant-Based & Digestión Ligera',
        publishedAt: '2026-08-10T08:00:00.000Z',
        isPublished: true,
        days: initialDays
      };
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
      days: []
    };
  },

  // Publicar menú desde la Nutrióloga para cualquier semana seleccionada
  publishMenu({ weekInput = 1, week = 1, daysPerWeek, dietOptionA, dietOptionB, dishSelection }) {
    const weekInfo = this.normalizeWeek(weekInput || week);
    const ALL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const numDays = parseInt(daysPerWeek, 10) || 3;
    let dayNames = [];

    if (numDays === 5) {
      dayNames = ALL_DAYS;
    } else if (numDays === 3) {
      dayNames = ['Lunes', 'Miércoles', 'Viernes'];
    } else if (numDays === 2) {
      dayNames = ['Lunes', 'Miércoles']; // Lunes y Miércoles explícito
    } else if (numDays === 1) {
      dayNames = ['Lunes'];
    } else if (numDays === 4) {
      dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves'];
    } else {
      dayNames = ALL_DAYS.slice(0, numDays);
    }

    const days = dayNames.map((dayName) => {
      const dayDishes = dishSelection[dayName] || {};
      const optA = dayDishes.optionA || {};
      const optB = dayDishes.optionB || {};
      const defaultInfo = DEFAULT_RECIPES[dayName] || DEFAULT_RECIPES.Lunes;

      const methodA = (optA.method && optA.method.trim()) || defaultInfo.methodA;
      const methodB = (optB.method && optB.method.trim()) || defaultInfo.methodB;

      return {
        dayName,
        dateLabel: weekInfo.dayDates[dayName] || `${dayName}, ${weekInfo.dateRange}`,
        optionA: {
          id: `${weekInfo.weekKey}-${dayName.toLowerCase()}-a`,
          name: optA.name || 'Platillo Proteico',
          category: dietOptionA || 'Balance Proteico',
          calories: 480,
          protein: '35g',
          carbs: '40g',
          fats: '14g',
          allergens: [],
          tags: ['Alto en Proteína', 'Control Glucémico'],
          image: defaultInfo.imageA,
          recipe: {
            ingredients: (optA.ingredients && optA.ingredients.trim()) || '150g Proteína base, 80g Vegetales, 50g Carbohidrato',
            method: methodA
          }
        },
        optionB: {
          id: `${weekInfo.weekKey}-${dayName.toLowerCase()}-b`,
          name: optB.name || 'Platillo Plant-Based',
          category: dietOptionB || 'Plant-Based & Digestión Ligera',
          calories: 430,
          protein: '18g',
          carbs: '50g',
          fats: '16g',
          allergens: [],
          tags: ['Plant-Based', 'Fibra Activa'],
          image: defaultInfo.imageB,
          recipe: {
            ingredients: (optB.ingredients && optB.ingredients.trim()) || '140g Base vegetal, 100g Vegetales, 60g Grano',
            method: methodB
          }
        }
      };
    });

    const activeMenu = {
      weekKey: weekInfo.weekKey,
      weekNumber: weekInfo.weekNumber,
      dateRange: weekInfo.dateRange,
      title: weekInfo.title,
      daysPerWeek: String(numDays),
      dietOptionA,
      dietOptionB,
      publishedAt: new Date().toISOString(),
      isPublished: true,
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
    return activeMenu;
  },

  // Obtener pedidos de empleados de cualquier semana
  getEmployeeOrders(weekInput = 1) {
    const weekInfo = this.normalizeWeek(weekInput);
    try {
      const stored = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}${weekInfo.weekKey}`);
      if (stored) return JSON.parse(stored);
      const storedByNum = localStorage.getItem(`${ORDERS_STORAGE_PREFIX}w${weekInfo.weekNumber}`);
      if (storedByNum) return JSON.parse(storedByNum);
      if (weekInfo.weekNumber === 1) {
        const legacy = localStorage.getItem(LEGACY_ORDERS_KEY);
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
  }
};
