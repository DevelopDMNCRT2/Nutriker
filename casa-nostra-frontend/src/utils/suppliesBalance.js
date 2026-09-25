/**
 * suppliesBalance.js - Funciones puras para balance, normalización y cálculo de insumos y nutrición.
 */

// Normalización de tipos de unidad
export const UNIT_TYPES = {
  MASS: 'mass',
  VOLUME: 'volume',
  PIECE: 'piece',
  OTHER: 'other'
};

/**
 * Detecta la categoría de unidad y devuelve la unidad base y factor de conversión a base.
 * Base para masa: 'g'
 * Base para volumen: 'ml'
 * Base para piezas: 'pza'
 */
export function getUnitMetadata(unitRaw = '') {
  const u = String(unitRaw || '').trim().toLowerCase();
  
  if (!u) {
    return { type: UNIT_TYPES.PIECE, baseUnit: 'pza', factor: 1, standardUnit: 'pza' };
  }

  // Masa
  if (['g', 'gr', 'gramo', 'gramos'].includes(u)) {
    return { type: UNIT_TYPES.MASS, baseUnit: 'g', factor: 1, standardUnit: 'g' };
  }
  if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(u)) {
    return { type: UNIT_TYPES.MASS, baseUnit: 'g', factor: 1000, standardUnit: 'kg' };
  }
  if (['mg', 'miligramo', 'miligramos'].includes(u)) {
    return { type: UNIT_TYPES.MASS, baseUnit: 'g', factor: 0.001, standardUnit: 'mg' };
  }

  // Volumen
  if (['ml', 'mililitro', 'mililitros'].includes(u)) {
    return { type: UNIT_TYPES.VOLUME, baseUnit: 'ml', factor: 1, standardUnit: 'ml' };
  }
  if (['l', 'lt', 'lts', 'litro', 'litros'].includes(u)) {
    return { type: UNIT_TYPES.VOLUME, baseUnit: 'ml', factor: 1000, standardUnit: 'L' };
  }

  // Piezas
  if (['pza', 'pzas', 'pieza', 'piezas', 'unidad', 'unidades', 'porcion', 'porciones', 'rebanada', 'rebanadas', 'diente', 'dientes', 'hoja', 'hojas'].includes(u)) {
    return { type: UNIT_TYPES.PIECE, baseUnit: 'pza', factor: 1, standardUnit: 'pza' };
  }

  // Cucharas y tazas (dejar como están pero estandarizar)
  if (['cda', 'cdas', 'cucharada', 'cucharadas'].includes(u)) {
    return { type: UNIT_TYPES.OTHER, baseUnit: 'cda', factor: 1, standardUnit: 'cda' };
  }
  if (['cdta', 'cdtas', 'cucharadita', 'cucharaditas'].includes(u)) {
    return { type: UNIT_TYPES.OTHER, baseUnit: 'cdta', factor: 1, standardUnit: 'cdta' };
  }
  if (['taza', 'tazas'].includes(u)) {
    return { type: UNIT_TYPES.OTHER, baseUnit: 'taza', factor: 1, standardUnit: 'taza' };
  }

  return { type: UNIT_TYPES.OTHER, baseUnit: u, factor: 1, standardUnit: u };
}

/**
 * Normaliza una cantidad a su valor en la unidad base.
 */
export function toBaseAmount(amount, unitRaw) {
  if (amount === null || amount === undefined || isNaN(amount)) return 0;
  const meta = getUnitMetadata(unitRaw);
  return Number(amount) * meta.factor;
}

/**
 * Formatea un valor numérico redondeando decimales flotantes limpiamente.
 */
export function roundNumber(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return null;
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(Number(val) * factor) / factor;
  return rounded;
}

/**
 * Formateador unificado para Requerido, Comprado y Merma.
 * Convierte de unidad base a presentación legible (ej. 2500g -> 2.5 kg).
 */
export function formatSupplyDisplay(baseAmount, unitType, originalStandardUnit = '') {
  if (baseAmount === null || baseAmount === undefined || isNaN(baseAmount)) {
    return { amount: null, unit: originalStandardUnit, formattedText: '—' };
  }

  const num = Number(baseAmount);

  if (unitType === UNIT_TYPES.MASS) {
    if (Math.abs(num) >= 1000) {
      const kgVal = roundNumber(num / 1000, 2);
      return { amount: kgVal, unit: 'kg', formattedText: `${kgVal} kg` };
    }
    const gVal = roundNumber(num, 1);
    return { amount: gVal, unit: 'g', formattedText: `${gVal} g` };
  }

  if (unitType === UNIT_TYPES.VOLUME) {
    if (Math.abs(num) >= 1000) {
      const lVal = roundNumber(num / 1000, 2);
      return { amount: lVal, unit: 'L', formattedText: `${lVal} L` };
    }
    const mlVal = roundNumber(num, 1);
    return { amount: mlVal, unit: 'ml', formattedText: `${mlVal} ml` };
  }

  if (unitType === UNIT_TYPES.PIECE) {
    const pzaVal = roundNumber(num, 1);
    return { amount: pzaVal, unit: 'pza', formattedText: `${pzaVal} pza` };
  }

  const otherVal = roundNumber(num, 1);
  return { amount: otherVal, unit: originalStandardUnit || '', formattedText: `${otherVal} ${originalStandardUnit || ''}`.trim() };
}

/**
 * Calcula el balance de aprovechamiento y merma entre cantidad requerida y comprada.
 * Ambas cantidades deben estar expresadas en la misma unidad base.
 */
export function calculateSupplyYield(requiredBase, purchasedBase) {
  if (purchasedBase === null || purchasedBase === undefined || isNaN(purchasedBase) || purchasedBase <= 0) {
    return {
      yieldPercent: null,
      wasteBase: null,
      status: 'pending',
      statusLabel: 'Sin Capturar'
    };
  }

  const req = Number(requiredBase);
  const pur = Number(purchasedBase);
  const yieldPercent = Math.round((req / pur) * 100);
  const wasteBase = roundNumber(pur - req, 2);

  let status = 'pending';
  let statusLabel = 'Sin Capturar';

  if (yieldPercent >= 85 && yieldPercent <= 98) {
    status = 'optimal';
    statusLabel = 'Óptimo (85-98%)';
  } else if ((yieldPercent >= 70 && yieldPercent < 85) || (yieldPercent > 98 && yieldPercent <= 105)) {
    status = 'warning';
    statusLabel = yieldPercent > 98 ? 'Inventario Justo' : 'Merma Moderada';
  } else {
    status = 'alert';
    statusLabel = yieldPercent < 70 ? 'Merma Alta (>30%)' : 'Posible Subcompra';
  }

  return {
    yieldPercent,
    wasteBase,
    status,
    statusLabel
  };
}

/**
 * Extrae la información nutricional de un platillo sin inventar valores ficticios por defecto.
 * Si un campo no existe o es indefinido, devuelve null.
 */
export function extractDishNutritionSafe(dish) {
  if (!dish) {
    return { calories: null, protein: null, carbs: null, fats: null, sodium: null };
  }

  const nut = dish.recipe?.nutrition || dish.nutrition || {};

  const parseSafe = (val) => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const match = String(val).replace(',', '.').match(/[\d]+(?:[.,]\d+)?/);
    return match ? parseFloat(match[0]) : null;
  };

  return {
    calories: parseSafe(nut.calories ?? dish.calories ?? nut.calorias ?? nut.kcal),
    protein: parseSafe(nut.protein ?? dish.protein ?? dish.proteinas_g ?? nut.proteina),
    carbs: parseSafe(nut.carbs ?? dish.carbs ?? dish.carbohidratos_g ?? nut.carbohidratos),
    fats: parseSafe(nut.fats ?? dish.fats ?? dish.grasas_g ?? nut.grasas),
    sodium: parseSafe(nut.sodium ?? dish.sodium ?? nut.sodio ?? dish.sodio_mg ?? nut.sodio_mg)
  };
}

/**
 * Precios de referencia promedio de mercado (MXN) para insumos alimentarios en México.
 * Se utilizan como estimador automático cuando la factura física no desglosa costo unitario.
 */
export const REFERENCE_SUPPLY_PRICES = {
  // Proteínas y carnes
  res: 140,
  carne: 140,
  pollo: 95,
  pechuga: 115,
  pescado: 130,
  atun: 120,
  salmon: 210,
  cerdo: 100,
  huevo: 48,
  // Lácteos
  leche: 28,
  queso: 120,
  yogur: 42,
  mantequilla: 110,
  crema: 55,
  // Frutas
  manzana: 38,
  platano: 22,
  papaya: 28,
  naranja: 20,
  fresa: 65,
  fruta: 35,
  // Verduras
  jitomate: 32,
  tomate: 32,
  cebolla: 28,
  papa: 28,
  calabaza: 26,
  calabacita: 26,
  zanahoria: 22,
  espinaca: 35,
  lechuga: 22,
  chayote: 25,
  brocoli: 35,
  aguacate: 75,
  verdura: 30,
  // Granos, semillas y abarrotes
  arroz: 28,
  frijol: 38,
  lenteja: 36,
  avena: 30,
  pasta: 26,
  aceite: 48,
  pan: 40,
  tortilla: 24,
  azucar: 32,
  sal: 16,
  harina: 22,
  almendra: 180,
  nuez: 220,
  miel: 120,
  sirloin: 160,
  sirlon: 160
};

/**
 * Obtiene el precio unitario estimado para un insumo según su nombre y unidad.
 */
export function getEstimatedSupplyUnitPrice(itemName = '', unitType = 'mass', unitName = 'kg') {
  const lower = String(itemName || '').toLowerCase();
  for (const [key, price] of Object.entries(REFERENCE_SUPPLY_PRICES)) {
    if (lower.includes(key)) {
      if (unitType === UNIT_TYPES.PIECE || unitName === 'pza') return roundNumber(price * 0.1, 2) || 4.5;
      if (unitName === 'g' || unitName === 'ml') return roundNumber(price / 1000, 4) || 0.05;
      return price;
    }
  }
  if (unitType === UNIT_TYPES.PIECE || unitName === 'pza') return 4.5;
  if (unitType === UNIT_TYPES.VOLUME || unitName === 'L' || unitName === 'lt') return 30.0;
  if (unitName === 'g' || unitName === 'ml') return 0.035; // 35.0 MXN / 1000g
  return 35.0; // mass kg default
}

/**
 * Agrega y totaliza todas las facturas y compras de insumos alimentarios capturadas
 * en el módulo de cocina (almacenadas en casanostra_purchases_* en localStorage).
 */
export function getCapturedFoodPurchasesSummary() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { totalCost: 0, itemsCount: 0, weeksCount: 0, details: [] };
  }

  const processedWeekNumbers = new Set();
  const keysToProcess = [];

  // 1. Escanear claves de purchases
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('casanostra_purchases_')) {
      if (k.includes('-W')) {
        keysToProcess.push(k);
        const parts = k.split('-W');
        if (parts[1]) processedWeekNumbers.add(parseInt(parts[1], 10));
      }
    }
  }

  // 2. Claves con formato 'casanostra_purchases_w<num>' que no hayan sido procesadas con weekKey
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('casanostra_purchases_w') && !k.includes('-W')) {
      const match = k.match(/_w(\d+)/);
      const wNum = match ? parseInt(match[1], 10) : null;
      if (wNum && !processedWeekNumbers.has(wNum)) {
        keysToProcess.push(k);
        processedWeekNumbers.add(wNum);
      }
    }
  }

  let totalCost = 0;
  let itemsCount = 0;
  const details = [];

  keysToProcess.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([itemKey, itemVal]) => {
          if (!itemVal) return;
          const amount = itemVal.amount !== null && itemVal.amount !== undefined ? parseFloat(itemVal.amount) : null;
          const explicitCost = itemVal.cost !== null && itemVal.cost !== undefined ? parseFloat(itemVal.cost) : null;

          if ((amount !== null && amount > 0) || (explicitCost !== null && explicitCost > 0)) {
            let cost = 0;
            if (explicitCost !== null && !isNaN(explicitCost) && explicitCost > 0) {
              cost = explicitCost;
            } else if (amount !== null && !isNaN(amount) && amount > 0) {
              let normalizedAmount = amount;
              let unitType = 'mass';
              let unitName = 'kg';

              // Detección de unidad por metadatos del objeto, clave o magnitud
              const rawUnit = String(itemVal.unit || itemVal.displayUnit || '').toLowerCase();
              if (rawUnit === 'g' || rawUnit === 'ml' || itemKey.endsWith('_g') || itemKey.endsWith('_ml') || (itemKey.includes('|mass') && amount >= 100) || amount >= 100) {
                normalizedAmount = amount / 1000;
                unitName = (rawUnit === 'ml' || itemKey.endsWith('_ml')) ? 'L' : 'kg';
                unitType = (rawUnit === 'ml' || itemKey.endsWith('_ml')) ? 'volume' : 'mass';
              } else if (rawUnit === 'pza' || itemKey.endsWith('_pza') || itemKey.includes('|piece')) {
                unitType = 'piece';
                unitName = 'pza';
              } else if (rawUnit === 'l' || itemKey.endsWith('_l') || itemKey.includes('|volume')) {
                unitType = 'volume';
                unitName = 'L';
              }

              const itemName = itemVal.name || itemKey.split('|')[0];
              const unitPrice = getEstimatedSupplyUnitPrice(itemName, unitType, unitName);
              cost = roundNumber(normalizedAmount * unitPrice, 2);
            }

            totalCost += cost;
            itemsCount += 1;
            details.push({
              key: itemKey,
              name: itemVal.name || itemKey,
              amount: amount || 0,
              cost: roundNumber(cost, 2),
              date: itemVal.updatedAt ? itemVal.updatedAt.slice(0, 10) : ''
            });
          }
        });
      }
    } catch (e) {
      console.warn('Error reading purchase key:', k, e);
    }
  });

  return {
    totalCost: roundNumber(totalCost, 2) || 0,
    itemsCount,
    weeksCount: keysToProcess.length,
    details
  };
}
