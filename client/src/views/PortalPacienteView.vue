<template>
  <div class="portal-dashboard">
    <!-- ── NAVBAR SUPERIOR ── -->
    <header class="dashboard-header print-hide">
      <div class="header-brand">
        <div class="brand-badge">Mi Portal NutriKer</div>
        <h1 class="greeting">Hola, {{ nombreCorto }}</h1>
      </div>
      <div class="header-actions">
        <button @click="cerrarSesion" class="logout-btn" title="Cerrar sesión">
          Cerrar Sesión &rarr;
        </button>
      </div>
    </header>

    <div v-if="cargandoGeneral" class="loader-container print-hide">
      <div class="spinner"></div>
      <p>Cargando tu expediente...</p>
    </div>

    <div v-else class="dashboard-layout">
      <!-- ── SIDEBAR LÍNEA DE TIEMPO (VISITAS) ── -->
      <aside class="timeline-sidebar print-hide">
        <h3 class="sidebar-title">Mis Consultas</h3>
        
        <div v-if="visitas.length === 0" class="no-data-msg">
          Aún no tienes consultas registradas.
        </div>

        <div class="timeline-list">
          <button 
            v-for="(visita, index) in visitas" 
            :key="visita.id"
            @click="seleccionarVisita(index)"
            :class="['timeline-item', { active: visitaSeleccionadaIndex === index }]"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ formatFechaLetras(visita.fecha) }}</span>
              <span class="timeline-weight">{{ visita.medicion.peso }} kg</span>
            </div>
          </button>
        </div>
      </aside>

      <!-- ── MAIN CONTENT (TARJETAS) ── -->
      <main class="dashboard-main" v-if="visitaActiva">
        
        <!-- Tarjeta 1: Observaciones Médicas -->
        <div class="glass-card section-card print-hide">
          <div class="card-header-flex">
            <div class="icon-title">
              <span class="text-2xl">👩‍⚕️</span>
              <h2>Observaciones de la Dra. Karla</h2>
            </div>
            <span class="badge-date">Consulta del {{ formatFechaLetras(visitaActiva.fecha) }}</span>
          </div>
          <div class="card-body mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="info-box">
                <span class="info-label">Diagnóstico General</span>
                <p class="info-value">{{ expediente?.diagnostico || 'Sin diagnóstico registrado' }}</p>
              </div>
              <div class="info-box bg-yellow-50 border-yellow-100">
                <span class="info-label text-yellow-700">Notas de esta visita</span>
                <p class="info-value text-yellow-900">{{ visitaActiva.medicion.observaciones || 'Buen progreso, continuar con las indicaciones.' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Biométricos y Evolución -->
        <div class="glass-card section-card mt-6 print-hide">
           <div class="icon-title mb-4">
              <span class="text-2xl">📊</span>
              <h2>Biométricos y Evolución</h2>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="metric-box">
                <span class="metric-label">Peso</span>
                <span class="metric-value">{{ visitaActiva.medicion.peso }} <small>kg</small></span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Estatura</span>
                <span class="metric-value">{{ datosPaciente?.estatura || '--' }} <small>m</small></span>
              </div>
              <div class="metric-box">
                <span class="metric-label">IMC</span>
                <span class="metric-value">{{ visitaActiva.medicion.imc || '--' }}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Cintura</span>
                <span class="metric-value">{{ visitaActiva.medicion.cintura || '--' }} <small>cm</small></span>
              </div>
            </div>

            <!-- Gráfica -->
            <div class="chart-wrapper" :class="{ 'hidden': mediciones.length < 2 }">
              <canvas id="evolutionChart"></canvas>
            </div>
            <p v-if="mediciones.length < 2" class="text-xs text-gray-400 text-center">Se requieren 2 consultas para generar tu gráfica de progreso.</p>
        </div>

        <!-- Tarjeta 3: Menú Asignado -->
        <div class="glass-card section-card mt-6 menu-print-container" id="menu-section">
           <div class="flex justify-between items-start mb-4 print-hide">
             <div class="icon-title">
                <span class="text-2xl">🥗</span>
                <h2>Menú Inteligente Asignado</h2>
              </div>
              <button @click="imprimirMenu" class="btn-outline-primary" v-if="visitaActiva.menu">
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Descargar / Imprimir
              </button>
           </div>

           <div v-if="!visitaActiva.menu" class="text-center py-8 bg-gray-50 rounded-xl print-hide">
             <p class="text-gray-500">No hay un menú asociado a esta consulta.</p>
           </div>
           
           <div v-else>
              <div class="menu-print-header hidden print-show mb-6 text-center">
                <h1 class="text-2xl font-bold text-brand-700">Plan Nutricional: {{ paciente.nombre }}</h1>
                <p class="text-gray-600">Dra. Karla - Clínica NutriKer | Fecha: {{ formatFechaLetras(visitaActiva.fecha) }}</p>
                <div v-if="visitaActiva.menu.notas" class="mt-2 text-sm italic text-gray-700">"{{ visitaActiva.menu.notas }}"</div>
              </div>

              <!-- Vista de Días para el Menu -->
              <div class="day-selector print-hide mb-4">
                <button 
                  v-for="dia in diasSemana" 
                  :key="dia.key"
                  @click="diaMenuSeleccionado = dia.key"
                  :class="['day-btn', { active: diaMenuSeleccionado === dia.key }]"
                >
                  {{ dia.label }}
                </button>
              </div>

              <!-- Vista en pantalla (Un día a la vez) -->
              <div class="meals-container print-hide">
                <template v-for="tiempo in tiemposComida" :key="tiempo.key">
                  <div 
                    v-if="visitaActiva.menu[`${diaMenuSeleccionado}_${tiempo.key}`] && !isLibreOAyuno(visitaActiva.menu[`${diaMenuSeleccionado}_${tiempo.key}`])"
                    class="meal-card"
                  >
                    <div class="meal-header">
                      <span class="meal-icon">{{ tiempo.icon }}</span>
                      <h4 class="meal-title">{{ tiempo.label }}</h4>
                    </div>
                    <div class="meal-body">
                      {{ visitaActiva.menu[`${diaMenuSeleccionado}_${tiempo.key}`] }}
                    </div>
                  </div>
                </template>
              </div>

              <!-- Vista para imprimir (Todos los días) -->
              <div class="hidden print-show print-grid">
                <div v-for="dia in diasSemana" :key="'print-'+dia.key" class="print-day-card break-inside-avoid mb-6">
                  <h3 class="font-bold text-lg text-brand-700 mb-2 border-b pb-1">{{ dia.label }}</h3>
                  <div class="space-y-2">
                    <template v-for="tiempo in tiemposComida" :key="'print-'+dia.key+'-'+tiempo.key">
                      <div v-if="visitaActiva.menu[`${dia.key}_${tiempo.key}`] && !isLibreOAyuno(visitaActiva.menu[`${dia.key}_${tiempo.key}`])">
                        <span class="font-bold text-sm">{{ tiempo.label }}:</span>
                        <p class="text-sm text-gray-800 ml-2">{{ visitaActiva.menu[`${dia.key}_${tiempo.key}`] }}</p>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

           </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

const router = useRouter()
const paciente = ref(null)
const datosPaciente = ref(null)
const expediente = ref(null)
const mediciones = ref([])
const allMenus = ref([])

const cargandoGeneral = ref(true)

const diasSemana = [
  { key: 'lunes', label: 'Lunes', corto: 'L' },
  { key: 'martes', label: 'Martes', corto: 'M' },
  { key: 'miercoles', label: 'Miércoles', corto: 'Mi' },
  { key: 'jueves', label: 'Jueves', corto: 'J' },
  { key: 'viernes', label: 'Viernes', corto: 'V' },
  { key: 'sabado', label: 'Sábado', corto: 'S' },
  { key: 'domingo', label: 'Domingo', corto: 'D' },
]
const diaMenuSeleccionado = ref('lunes')

const tiemposComida = [
  { key: 'desayuno', label: 'Desayuno', icon: '🌅' },
  { key: 'colacion_am', label: 'Colación AM', icon: '🍎' },
  { key: 'comida', label: 'Comida', icon: '🍲' },
  { key: 'colacion_pm', label: 'Colación PM', icon: '🍌' },
  { key: 'cena', label: 'Cena', icon: '🌙' },
]

const nombreCorto = computed(() => {
  if (!paciente.value?.nombre) return ''
  return paciente.value.nombre.split(' ')[0]
})

function formatFechaLetras(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} ${meses[parseInt(m)-1]} ${y}`
}

function isLibreOAyuno(texto) {
  if (!texto) return true
  const lower = texto.toLowerCase()
  return lower.includes('libre') || lower.includes('ayuno') || lower.includes('no aplica') || lower.trim() === ''
}

// Transformar datos en "Visitas"
const visitas = computed(() => {
  const sortedMediciones = [...mediciones.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  
  return sortedMediciones.map(m => {
    // Buscar el menú más cercano a esta fecha (o asignado en esta fecha)
    // Para simplificar, buscamos un menú creado en la misma semana o el más reciente anterior a la cita
    // Como fallback, agarramos el menú en la misma posición de la cita (si hay 3 citas y 3 menús)
    let menuAsignado = allMenus.value.find(menu => menu.semanaInicio === m.fecha)
    if (!menuAsignado && allMenus.value.length > 0) {
      // Tomar el más reciente que no sea del futuro lejano
      menuAsignado = allMenus.value[0] 
    }
    
    return {
      id: m.id,
      fecha: m.fecha,
      medicion: m,
      menu: menuAsignado
    }
  })
})

const visitaSeleccionadaIndex = ref(0)
const visitaActiva = computed(() => {
  if (visitas.value.length === 0) return null
  return visitas.value[visitaSeleccionadaIndex.value]
})

function seleccionarVisita(index) {
  visitaSeleccionadaIndex.value = index
}

// Dibujar Gráfica
let chartInstance = null
watch(visitaSeleccionadaIndex, async () => {
  if (mediciones.value.length >= 2) {
    await nextTick()
    dibujarGrafica()
  }
})

function dibujarGrafica() {
  const canvas = document.getElementById('evolutionChart')
  if (!canvas) return
  if (chartInstance) chartInstance.destroy()

  const fechas = mediciones.value.map(m => formatFechaLetras(m.fecha))
  const pesos = mediciones.value.map(m => m.peso)

  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(74, 140, 91, 0.4)')
  gradient.addColorStop(1, 'rgba(74, 140, 91, 0.0)')

  // @ts-ignore
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Peso (kg)',
        data: pesos,
        borderColor: '#4a8c5b',
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4a8c5b',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  })
}

async function cargarDatosGlobales() {
  cargandoGeneral.value = true
  try {
    const pacienteId = paciente.value.id
    const pRes = await api.get(`/pacientes/${pacienteId}`).catch(() => null)
    if (pRes) datosPaciente.value = pRes

    const expRes = await api.get(`/expedientes/paciente/${pacienteId}`).catch(() => null)
    if (expRes) {
      expediente.value = expRes.expediente
      mediciones.value = expRes.mediciones || []
    }

    const menusRes = await api.get(`/menus/paciente/${pacienteId}`).catch(() => [])
    if (Array.isArray(menusRes)) {
      allMenus.value = menusRes
    }

    if (mediciones.value.length >= 2) {
      await nextTick()
      dibujarGrafica()
    }
  } catch (err) {
    console.error('Error cargando portal:', err)
  } finally {
    cargandoGeneral.value = false
  }
}

function imprimirMenu() {
  window.print()
}

function cerrarSesion() {
  localStorage.removeItem('paciente_token')
  localStorage.removeItem('paciente_data')
  router.push('/miperfil')
}

onMounted(() => {
  const saved = localStorage.getItem('paciente_data')
  const token = localStorage.getItem('paciente_token')
  if (saved && token) {
    try {
      paciente.value = JSON.parse(saved)
      cargarDatosGlobales()
    } catch (e) {
      cerrarSesion()
    }
  } else {
    cerrarSesion()
  }
})
</script>

<style scoped>
/* ── VARIABLES GLOBALES ── */
.portal-dashboard {
  --brand: #4a8c5b;
  --brand-light: #eaf3ed;
  --bg-color: #f4f7f5;
  --glass-bg: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(255, 255, 255, 0.6);
  --shadow-soft: 0 10px 40px rgba(0, 0, 0, 0.04);
  
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: #1f2937;
}

/* ── HEADER ── */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.brand-badge {
  display: inline-block;
  background: var(--brand-light);
  color: var(--brand);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.greeting {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.logout-btn {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}
.logout-btn:hover { color: #ef4444; }

/* ── LAYOUT PRINCIPAL (GRID) ── */
.dashboard-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;
}

@media (max-width: 900px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

/* ── SIDEBAR TIMELINE ── */
.timeline-sidebar {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid #f3f4f6;
}

.sidebar-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #374151;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.timeline-item:hover {
  background: #f9fafb;
}

.timeline-item.active {
  background: var(--brand-light);
  border-color: rgba(74, 140, 91, 0.2);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  transition: background 0.2s;
}

.timeline-item.active .timeline-dot {
  background: var(--brand);
  box-shadow: 0 0 0 4px rgba(74, 140, 91, 0.2);
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.timeline-weight {
  font-size: 0.75rem;
  color: #6b7280;
}

.timeline-item.active .timeline-date {
  color: var(--brand);
}

/* ── MAIN CARDS ── */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.icon-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-title h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.badge-date {
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
}

.info-box {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 1rem;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

/* Biométricos */
.metric-box {
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--brand);
}
.metric-value small { font-size: 0.9rem; color: #9ca3af; }

.chart-wrapper {
  height: 250px;
  width: 100%;
}

/* ── MENÚ ── */
.btn-outline-primary {
  display: flex;
  align-items: center;
  border: 2px solid var(--brand);
  color: var(--brand);
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline-primary:hover {
  background: var(--brand);
  color: white;
}

.day-selector {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.day-btn {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
}
.day-btn.active {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
}

.meals-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meal-card {
  background: white;
  border-left: 4px solid var(--brand);
  border-radius: 0 12px 12px 0;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.meal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.meal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.meal-body {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
  margin-left: 2rem;
}

/* ── LOADER ── */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #6b7280;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid var(--brand-light);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── PRINT STYLES ── */
.print-show { display: none; }

@media print {
  @page { margin: 1cm; }
  body * {
    visibility: hidden;
  }
  .print-hide { display: none !important; }
  .print-show { display: block !important; }
  
  #menu-section, #menu-section * {
    visibility: visible;
  }
  #menu-section {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none;
    box-shadow: none;
    padding: 0;
  }
  
  .menu-print-header {
    border-bottom: 2px solid var(--brand);
    padding-bottom: 1rem;
  }
  
  .print-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
</style>
