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
