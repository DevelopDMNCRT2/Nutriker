/**
 * exportMenuCSV.js
 * Genera y descarga automáticamente un archivo CSV ordenado y compacto del menú de cocina.
 * Diseñado específicamente para que en Excel / Numbers no sea excesivamente ancho y quepa
 * en una sola página de impresión para el personal de cocina.
 */

const SERVICES_CONFIG = {
  desayuno: { label: 'Desayuno' },
  comida:   { label: 'Comida Principal' },
  cena:     { label: 'Cena Ligera' }
};

const COURSE_LABELS = {
  soup:    '1er Tiempo — Sopa',
  optionA: '2do Tiempo — Platillo Fuerte',
  optionB: '3er Tiempo — Guarnición',
  optionC: '4to Tiempo — Postre'
};

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  // Reemplazar saltos de línea múltiples y espacios extra para mantener la celda compacta
  const str = String(val).trim().replace(/\r?\n/g, ' // ');
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportarDiaMenuCSV({ day, weekRange, census = 6 }) {
  if (!day) return;

  const diaLabel = day.dayName || 'Menú';
  const fechaLabel = day.date
    ? new Date(day.date + 'T12:00:00').toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const safeDayName = diaLabel
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const fileName = `CasaNostra_MenuCocina_${safeDayName}.csv`;

  const rows = [];

  // ── 1. ENCABEZADO INSTITUCIONAL ───────────────────────────────────────────
  rows.push([escapeCsvCell('RESIDENCIA GERIÁTRICA CASA NOSTRA — PLAN DE COCINA')]);
  rows.push([
    escapeCsvCell('Día:'),
    escapeCsvCell(diaLabel),
    escapeCsvCell('Fecha:'),
    escapeCsvCell(fechaLabel || 'Día programado'),
    escapeCsvCell('Censo Oficial:'),
    escapeCsvCell(`${census} Porciones`)
  ]);
  rows.push([]);

  // ── 2. TABLA COMPACTA DE RECETAS DE COCINA (ANCHO OPTIMIZADO PARA IMPRESIÓN) ──
  rows.push([escapeCsvCell('RECETAS Y PRODUCCIÓN DE COCINA')]);
  rows.push([
    escapeCsvCell('Turno'),
    escapeCsvCell('Tiempo'),
    escapeCsvCell('Platillo'),
    escapeCsvCell('Porciones'),
    escapeCsvCell('Alérgenos'),
    escapeCsvCell('Ingredientes'),
    escapeCsvCell('Instrucciones de Preparación')
  ]);

  const services = day.services || { comida: day };
  let count = 0;

  for (const [svcKey, svcCfg] of Object.entries(SERVICES_CONFIG)) {
    const serviceData = services[svcKey];
    if (!serviceData) continue;

    for (const [courseKey, courseLabel] of Object.entries(COURSE_LABELS)) {
      const dish = serviceData[courseKey];
      if (!dish || !dish.name) continue;

      count++;
      const allergens = Array.isArray(dish.allergens)
        ? dish.allergens.join(', ')
        : (dish.allergens || 'Ninguno');
      const ingredients = dish.recipe?.ingredients || dish.ingredients || '—';
      const method = dish.recipe?.method || dish.method || '—';

      rows.push([
        escapeCsvCell(svcCfg.label),
        escapeCsvCell(courseLabel),
        escapeCsvCell(dish.name),
        escapeCsvCell(`${census} porciones`),
        escapeCsvCell(allergens),
        escapeCsvCell(ingredients),
        escapeCsvCell(method)
      ]);
    }
  }

  if (count === 0) {
    rows.push([escapeCsvCell('Sin platillos registrados para este día')]);
  }

  // ── 3. CONSTRUCCIÓN CON BOM UTF-8 Y DESCARGA ──────────────────────────────
  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
