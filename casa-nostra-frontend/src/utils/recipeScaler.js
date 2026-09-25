/**
 * Utilidad para el cálculo y escalado automático de recetas técnicas y tablas nutricionales
 * basándose en el número de porciones asignadas.
 */

// Expresión regular para capturar cantidad (fracción, decimal o entero), unidad y nombre del ingrediente
const INGREDIENT_REGEX = /^[\s•\-\*]*(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(kg|g|gr|gramos|kilos|kilogramos|mg|l|lt|lts|litros|ml|mililitros|taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|pza|pzas|pieza|piezas|porcion|porciones|rebanada|rebanadas|diente|dientes|hoja|hojas)?\.?\s*(.*)$/i;

/**
 * Parsea un número en formato decimal o fracción ("1/2" -> 0.5)
 */
function parseQuantity(raw) {
  if (!raw) return null;
  const str = String(raw).trim().replace(',', '.');
  if (str.includes('/')) {
    const [num, den] = str.split('/');
    const n = parseFloat(num);
    const d = parseFloat(den);
    if (!isNaN(n) && !isNaN(d) && d !== 0) {
      return n / d;
    }
  }
  const val = parseFloat(str);
  return isNaN(val) ? null : val;
}

/**
 * Formatea un número limpiamente (máximo 2 decimales si es necesario)
 */
function formatAmount(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  const rounded = Math.round(val * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Normaliza y escala las unidades de medida (ej. 1500g -> 1.5 kg)
 */
function normalizeUnitAndAmount(amount, unit) {
  if (!unit || amount === null) return { amount, unit: unit || '' };
  const lower = unit.toLowerCase();

  // Gramos a Kilogramos
  if (['g', 'gr', 'gramos'].includes(lower)) {
    if (amount >= 1000) {
      return { amount: amount / 1000, unit: 'kg' };
    }
    return { amount, unit: 'g' };
  }

  // Mililitros a Litros
  if (['ml', 'mililitros'].includes(lower)) {
    if (amount >= 1000) {
      return { amount: amount / 1000, unit: 'L' };
    }
    return { amount, unit: 'ml' };
  }

  // Litros estándar
  if (['l', 'lt', 'lts', 'litros'].includes(lower)) {
    return { amount, unit: 'L' };
  }

  // Piezas estándar
  if (['pza', 'pzas', 'pieza', 'piezas'].includes(lower)) {
    return { amount, unit: amount === 1 ? 'pza' : 'pzas' };
  }

  return { amount, unit };
}

/**
 * Escala una línea individual de ingrediente
 */
export function scaleIngredientLine(line, portions = 1) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(INGREDIENT_REGEX);
  if (!match) {
    return {
      raw: trimmed,
      name: trimmed,
      amountBase: null,
      unit: '',
      amountScaled: null,
      displayBase: '1 porción',
      displayScaled: portions > 1 ? `x${portions} porciones` : '1 porción'
    };
  }

  const rawQty = match[1];
  const rawUnit = match[2];
  const rawName = match[3]?.trim() || trimmed;

  const baseAmount = parseQuantity(rawQty);

  if (baseAmount === null) {
    return {
      raw: trimmed,
      name: rawName || trimmed,
      amountBase: null,
      unit: rawUnit || '',
      amountScaled: null,
      displayBase: '1 porción',
      displayScaled: portions > 1 ? `x${portions} porciones` : '1 porción'
    };
  }

  const portionsCount = (typeof portions === 'number' && !isNaN(portions)) ? Math.max(0, portions) : (portions !== '' && portions !== null && portions !== undefined ? Math.max(0, parseInt(portions, 10) || 0) : 1);
  const scaledTotal = baseAmount * portionsCount;
  const normalizedBase = normalizeUnitAndAmount(baseAmount, rawUnit);
  const normalizedScaled = normalizeUnitAndAmount(scaledTotal, rawUnit);

  const displayBase = `${formatAmount(normalizedBase.amount)}${normalizedBase.unit ? ' ' + normalizedBase.unit : ''} ${rawName}`.trim();
  const displayScaled = `${formatAmount(normalizedScaled.amount)}${normalizedScaled.unit ? ' ' + normalizedScaled.unit : ''} ${rawName}`.trim();

  return {
    raw: trimmed,
    name: rawName,
    amountBase: normalizedBase.amount,
    unitBase: normalizedBase.unit,
    amountScaled: normalizedScaled.amount,
    unitScaled: normalizedScaled.unit,
    displayBase,
    displayScaled
  };
}

/**
 * Escala un bloque completo de ingredientes (string multilinea o separado por comas)
 * @param {string|Array} ingredientsInput - Texto con los ingredientes
 * @param {number} portions - Número de porciones para escalar
 * @returns {Array} Lista de ingredientes escalados
 */
export function scaleIngredients(ingredientsInput, portions = 1) {
  if (!ingredientsInput) return [];

  let lines = [];
  if (Array.isArray(ingredientsInput)) {
    lines = ingredientsInput;
  } else if (typeof ingredientsInput === 'string') {
    // Si contiene saltos de línea, dividir por línea; de lo contrario, por comas
    if (ingredientsInput.includes('\n')) {
      lines = ingredientsInput.split('\n');
    } else {
      lines = ingredientsInput.split(',');
    }
  } else {
    return [];
  }

  return lines
    .map(line => scaleIngredientLine(String(line), portions))
    .filter(Boolean);
}

/**
 * Extrae el valor numérico limpio de un string de macronutriente (ej. "35g" -> 35, "480 kcal" -> 480)
 */
export function extractMacroNumber(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const match = String(val).replace(',', '.').match(/[\d]+(?:[.,]\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * Escala la información nutricional completa en base a las porciones asignadas
 * @param {Object} nutritionData - { calories, protein, carbs, fats, fiber }
 * @param {number} portions - Cantidad de porciones producidas
 * @returns {Object} Desglose unitario y consolidado
 */
export function scaleNutrition(nutritionData = {}, portions = 1) {
  const data = nutritionData || {};
  const count = (typeof portions === 'number' && !isNaN(portions)) ? Math.max(0, portions) : (portions !== '' && portions !== null && portions !== undefined ? Math.max(0, parseInt(portions, 10) || 0) : 1);

  const calBase = extractMacroNumber(data.calories ?? data.calorias ?? data.kcal);
  const protBase = extractMacroNumber(data.protein ?? data.proteina ?? data.proteinas_g);
  const carbsBase = extractMacroNumber(data.carbs ?? data.carbohidratos ?? data.carbohidratos_g);
  const fatsBase = extractMacroNumber(data.fats ?? data.grasas ?? data.grasas_g);
  const fiberBase = extractMacroNumber(data.fiber ?? data.fibra ?? data.fibra_g);

  return {
    portions: count,
    unit: {
      calories: Math.round(calBase),
      protein: Math.round(protBase * 10) / 10,
      carbs: Math.round(carbsBase * 10) / 10,
      fats: Math.round(fatsBase * 10) / 10,
      fiber: Math.round(fiberBase * 10) / 10,
    },
    totalProduction: {
      calories: Math.round(calBase * count),
      protein: Math.round(protBase * count * 10) / 10,
      carbs: Math.round(carbsBase * count * 10) / 10,
      fats: Math.round(fatsBase * count * 10) / 10,
      fiber: Math.round(fiberBase * count * 10) / 10,
    }
  };
}
