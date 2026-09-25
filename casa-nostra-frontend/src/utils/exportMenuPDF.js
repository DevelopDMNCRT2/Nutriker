/**
 * exportMenuPDF.js
 * Solución definitiva para la Hoja de Trabajo y Producción de Cocina.
 * 
 * Funciones exportadas:
 *  1. imprimirMenuCocina: Abre el diálogo nativo de impresión del sistema con la hoja
 *     maquetada al 100% de escala (Carta / A4), tipografía grande y legible para cocineros.
 *  2. exportarDiaMenuPDF: Descarga automática directa del archivo PDF utilizando captura frontal
 *     visible (z-index: 99999) con indicador de carga para evitar por completo la hoja en blanco.
 */

const SERVICES_CONFIG = {
  desayuno: { label: 'Desayuno',         emoji: '🌅', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  comida:   { label: 'Comida Principal', emoji: '🍽️', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4' },
  cena:     { label: 'Cena Ligera',      emoji: '🌙', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' }
};

const COURSE_LABELS = {
  soup:    { label: '1er Tiempo', name: 'Sopa / Entrada',    badgeBg: '#FEF3C7', badgeColor: '#92400E' },
  optionA: { label: '2do Tiempo', name: 'Platillo Fuerte',   badgeBg: '#DBEAFE', badgeColor: '#1E40AF' },
  optionB: { label: '3er Tiempo', name: 'Guarnición',        badgeBg: '#DCFCE7', badgeColor: '#166534' },
  optionC: { label: '4to Tiempo', name: 'Postre',            badgeBg: '#F3E8FF', badgeColor: '#6B21A8' }
};

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateKitchenSheetHtml({ day, weekRange, census = 6 }) {
  const diaLabel = day.dayName || 'Menú';
  const fechaLabel = day.date
    ? new Date(day.date + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const fechaGen = new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const services = day.services || { comida: day };

  let servicesHtml = '';

  for (const [svcKey, cfg] of Object.entries(SERVICES_CONFIG)) {
    const serviceData = services[svcKey];
    if (!serviceData) continue;

    let dishesHtml = '';

    for (const [courseKey, course] of Object.entries(COURSE_LABELS)) {
      const dish = serviceData[courseKey];
      if (!dish || !dish.name) continue;

      const ingr = dish.recipe?.ingredients || dish.ingredients || 'Ingredientes estándar según recetario.';
      const meth = dish.recipe?.method || dish.method || 'Preparar según técnica institucional.';
      const alrg = Array.isArray(dish.allergens) ? dish.allergens.join(', ') : (dish.allergens || '');

      dishesHtml += `
        <div class="dish-card" style="border-left: 6px solid ${cfg.color};">
          <div class="dish-header">
            <div>
              <div class="dish-course" style="color: ${course.badgeColor};">
                ${esc(course.label)} &bull; ${esc(course.name)}
              </div>
              <div class="dish-name">${esc(dish.name)}</div>
            </div>
            <div class="portion-badge" style="background: ${cfg.color};">
              ${census} PORCIONES
            </div>
          </div>

          ${alrg ? `
            <div class="allergen-alert">
              &bull; ALÉRGENOS / CUIDADO: ${esc(alrg)}
            </div>
          ` : ''}

          <div class="recipe-grid">
            <div class="recipe-col">
              <div class="recipe-col-title">Ingredientes Requeridos:</div>
              <div class="recipe-text">${esc(ingr)}</div>
            </div>
            <div class="recipe-col">
              <div class="recipe-col-title">Instrucciones de Cocina:</div>
              <div class="recipe-text">${esc(meth)}</div>
            </div>
          </div>
        </div>
      `;
    }

    if (dishesHtml) {
      servicesHtml += `
        <div class="service-block">
          <div class="service-header" style="background: ${cfg.color};">
            <span>${cfg.emoji} ${cfg.label.toUpperCase()}</span>
            <span class="service-meta">Producción oficial: ${census} Residentes</span>
          </div>
          <div class="service-body" style="background: ${cfg.bg}; border-color: ${cfg.border};">
            ${dishesHtml}
          </div>
        </div>
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Hoja de Cocina - ${esc(diaLabel)}</title>
      <style>
        @page {
          size: letter portrait;
          margin: 12mm 12mm 12mm 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.4;
        }
        .container {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #0F4C35 0%, #15803D 100%) !important;
          color: #FFFFFF !important;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-sub {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #86EFAC !important;
        }
        .header-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 2px 0;
        }
        .header-date {
          font-size: 13px;
          font-weight: 700;
          color: #D1FAE5 !important;
          text-transform: capitalize;
        }
        .census-box {
          background: rgba(255, 255, 255, 0.18) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          padding: 8px 16px;
          border-radius: 8px;
          text-align: right;
        }
        .census-title {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: #A7F3D0 !important;
        }
        .census-num {
          font-size: 22px;
          font-weight: 900;
          color: #FFFFFF !important;
          line-height: 1.1;
        }
        .service-block {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .service-header {
          color: #FFFFFF !important;
          padding: 9px 16px;
          border-radius: 8px 8px 0 0;
          font-size: 14px;
          font-weight: 900;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .service-meta {
          font-size: 11px;
          font-weight: 700;
          opacity: 0.95;
        }
        .service-body {
          border: 1.5px solid #CBD5E1;
          border-top: none;
          border-radius: 0 0 8px 8px;
          padding: 12px;
        }
        .dish-card {
          background: #FFFFFF !important;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 10px;
          page-break-inside: avoid;
        }
        .dish-card:last-child {
          margin-bottom: 0;
        }
        .dish-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .dish-course {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dish-name {
          font-size: 17px;
          font-weight: 900;
          color: #0F172A;
          margin-top: 2px;
          line-height: 1.25;
        }
        .portion-badge {
          color: #FFFFFF !important;
          font-size: 12px;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 6px;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }
        .allergen-alert {
          background: #FEF2F2 !important;
          border: 1px solid #FCA5A5;
          color: #991B1B !important;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 12px;
          background: #F8FAFC !important;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }
        .recipe-col-title {
          font-size: 9.5px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.03em;
        }
        .recipe-text {
          font-size: 11.5px;
          line-height: 1.45;
          color: #1E293B;
          white-space: pre-line;
        }
        .footer {
          margin-top: 18px;
          border-top: 1.5px solid #CBD5E1;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          color: #64748B;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="header-sub">Residencia Geriátrica Casa Nostra &bull; Cocina Oficial</div>
            <div class="header-title">HOJA DE PRODUCCIÓN DE COCINA</div>
            <div class="header-date">${esc(fechaLabel || diaLabel)} ${weekRange ? `&bull; Ciclo: ${esc(weekRange)}` : ''}</div>
          </div>
          <div class="census-box">
            <div class="census-title">Censo Oficial</div>
            <div class="census-num">${census}</div>
            <div style="font-size: 8.5px; color: #D1FAE5;">Porciones por plato</div>
          </div>
        </div>

        ${servicesHtml || '<p style="text-align: center; color: #94A3B8; padding: 24px; font-weight: 700;">Sin platillos asignados para este día.</p>'}

        <div class="footer">
          <span>Casa Nostra &bull; Hoja de Trabajo Diaria para Cocineros</span>
          <span>Generado: ${esc(fechaGen)}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 1. IMPRIMIR FICHA DE COCINA (Solución Recomendada)
 * Abre directamente el diálogo nativo de impresión del sistema con vista previa a tamaño real.
 */
export function imprimirMenuCocina({ day, weekRange, census = 6 }) {
  if (!day) return;

  const htmlContent = generateKitchenSheetHtml({ day, weekRange, census });
  const printWindow = window.open('', '_blank', 'width=950,height=900');
  
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes para imprimir la hoja de cocina.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Esperar a que el navegador termine de cargar recursos para lanzar print
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}

/**
 * 2. DESCARGAR PDF DIRECTO
 * Genera el archivo PDF asegurando visibilidad frontal en pantalla durante la captura
 * para evitar el problema de la hoja en blanco de html2canvas.
 */
export async function exportarDiaMenuPDF({ day, weekRange, census = 6 }) {
  if (!day) return;

  const html2pdf = (await import('html2pdf.js')).default;
  const diaLabel = day.dayName || 'Menú';
  const safeDayName = diaLabel
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const fileName = `CasaNostra_HojaCocina_${safeDayName}.pdf`;

  // Contenedor temporal montado al frente pero en una capa limpia
  const overlay = document.createElement('div');
  overlay.id = 'pdf-render-overlay';
  overlay.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100vw',
    'height:100vh',
    'background:rgba(15,23,42,0.85)',
    'z-index:999999',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:flex-start',
    'padding-top:20px',
    'overflow-y:auto'
  ].join(';');

  const msg = document.createElement('div');
  msg.style.cssText = 'color:#ffffff;font-size:14px;font-weight:800;margin-bottom:12px;font-family:sans-serif;';
  msg.textContent = 'Generando Ficha de Cocina en PDF...';
  overlay.appendChild(msg);

  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'width:794px', // A4 exacto a 96dpi
    'background:#ffffff',
    'box-shadow:0 10px 25px rgba(0,0,0,0.5)',
    'border-radius:4px'
  ].join(';');

  // Inyectar el HTML limpio en el wrapper
  const rawHtml = generateKitchenSheetHtml({ day, weekRange, census });
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const contentNode = doc.querySelector('.container') || doc.body;

  // Extraer estilos del doc
  const styleNode = doc.querySelector('style');
  if (styleNode) wrapper.appendChild(styleNode.cloneNode(true));
  wrapper.appendChild(contentNode.cloneNode(true));
  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);

  try {
    await html2pdf()
      .set({
        margin:      [8, 0, 8, 0],
        filename:    fileName,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale:       2,
          useCORS:     true,
          logging:     false,
          windowWidth: 794,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(wrapper)
      .save();
  } finally {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }
}
