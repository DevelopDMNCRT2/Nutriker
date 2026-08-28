<template>
  <div class="portal-layout">
    <!-- ── HEADER FLOTANTE (GLASSMORPHISM) ── -->
    <header class="glass-header">
      <div class="header-content">
        <div class="user-info">
          <div class="avatar">{{ inicialNombre }}</div>
          <div>
            <h1 class="greeting">Hola, {{ nombreCorto }}</h1>
            <p class="subtitle">Expediente #{{ paciente?.id }}</p>
          </div>
        </div>
        <button @click="cerrarSesion" class="logout-btn" title="Cerrar sesión">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- ── NAVEGACIÓN POR PESTAÑAS ── -->
    <nav class="portal-tabs-wrapper">
      <div class="portal-tabs">
        <button @click="tabActiva = 'inicio'" :class="['tab-item', { active: tabActiva === 'inicio' }]">
          <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Inicio
        </button>
        <button @click="tabActiva = 'menu'" :class="['tab-item', { active: tabActiva === 'menu' }]">
          <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Mi Menú
        </button>
        <button @click="abrirEvolucion" :class="['tab-item', { active: tabActiva === 'evolucion' }]">
          <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
          Evolución
        </button>
      </div>
    </nav>

    <!-- ── ÁREA DE CONTENIDO PRINCIPAL ── -->
    <main class="portal-main">
      <div v-if="cargandoGeneral" class="loader-container">
        <div class="spinner"></div>
        <p>Cargando tu información...</p>
      </div>

      <div v-else class="tab-content-container">
        
        <!-- ── PESTAÑA: INICIO ── -->
        <div v-if="tabActiva === 'inicio'" class="tab-inicio animate-fade-in">
          
          <div class="glass-card gradient-card">
            <div class="card-icon">🎯</div>
            <h2>Objetivo Nutricional</h2>
            <p>{{ expediente?.objetivoNutricional || 'Mantenimiento y Salud General' }}</p>
          </div>

          <div class="metrics-grid mt-4">
            <div class="glass-card metric-card">
              <span class="metric-label">Último Peso</span>
              <span class="metric-value">{{ ultimoPeso }} kg</span>
            </div>
            <div class="glass-card metric-card">
              <span class="metric-label">Estatura</span>
              <span class="metric-value">{{ datosPaciente?.estatura || '--' }} m</span>
            </div>
          </div>
          
          <div v-if="expediente?.diagnostico" class="glass-card info-card mt-4">
            <h3 class="card-title">Diagnóstico Actual</h3>
            <p class="text-sm text-gray-700 mt-2">{{ expediente.diagnostico }}</p>
          </div>

          <div class="glass-card info-card mt-4 text-center">
             <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>
             <h3 class="card-title">Seguimiento Clínico</h3>
             <p class="text-sm text-gray-500 mt-1 mb-4">¿Tienes dudas con tu menú o necesitas agendar tu próxima revisión?</p>
             <a href="https://wa.me/5211234567890" target="_blank" class="btn-primary">
               Contactar a la Clínica
             </a>
          </div>
        </div>

        <!-- ── PESTAÑA: MENÚ INTELIGENTE ── -->
        <div v-if="tabActiva === 'menu'" class="tab-menu animate-fade-in">
          <div v-if="!menuActivo" class="glass-card text-center py-10">
            <div class="text-4xl mb-3">🥗</div>
            <h3 class="text-lg font-bold text-gray-800">No hay un menú activo</h3>
            <p class="text-sm text-gray-500 mt-2">Tu nutrióloga asignará tu plan nutricional muy pronto.</p>
          </div>

          <div v-else>
            <div class="menu-header mb-4">
              <h2 class="text-xl font-bold text-gray-800">{{ menuActivo.nombre }}</h2>
              <p class="text-xs text-brand-600 font-semibold bg-brand-50 inline-block px-3 py-1 rounded-full mt-2">Semana del {{ formatFecha(menuActivo.semanaInicio) }}</p>
            </div>

            <!-- Selector de Días Horizontal -->
            <div class="day-selector">
              <button 
                v-for="dia in diasSemana" 
                :key="dia.key"
                @click="diaSeleccionado = dia.key"
                :class="['day-btn', { active: diaSeleccionado === dia.key }]"
              >
                <span class="day-name">{{ dia.corto }}</span>
              </button>
            </div>

            <!-- Comidas del Día Seleccionado -->
            <div class="meals-container mt-4 space-y-3">
              <template v-for="tiempo in tiemposComida" :key="tiempo.key">
                <!-- Filtramos los tiempos que dicen "Libre" o "Ayuno" para no mostrarlos y adaptarnos a la estructura dinámica de la doctora -->
                <div 
                  v-if="menuActivo[`${diaSeleccionado}_${tiempo.key}`] && !isLibreOAyuno(menuActivo[`${diaSeleccionado}_${tiempo.key}`])"
                  class="glass-card meal-card"
                >
                  <div class="meal-header">
                    <span class="meal-icon">{{ tiempo.icon }}</span>
                    <h4 class="meal-title">{{ tiempo.label }}</h4>
                  </div>
                  <div class="meal-body">
                    {{ menuActivo[`${diaSeleccionado}_${tiempo.key}`] }}
                  </div>
                </div>
              </template>
            </div>

            <div v-if="menuActivo.notas" class="glass-card mt-6 border-l-4 border-l-yellow-400 bg-yellow-50/50">
              <h4 class="text-sm font-bold text-yellow-800 mb-1">Notas de la Nutrióloga</h4>
              <p class="text-sm text-yellow-700 leading-relaxed">{{ menuActivo.notas }}</p>
            </div>
          </div>
        </div>

        <!-- ── PESTAÑA: EVOLUCIÓN (GRÁFICAS) ── -->
        <div v-if="tabActiva === 'evolucion'" class="tab-evolucion animate-fade-in">
          <div class="glass-card mb-4">
            <h3 class="card-title mb-4">Mi Evolución de Peso (kg)</h3>
            <div v-if="mediciones.length < 2" class="text-center py-6">
              <p class="text-sm text-gray-500">Se necesitan al menos 2 consultas para generar tu gráfica de evolución.</p>
            </div>
            <div class="chart-wrapper" :class="{ 'hidden': mediciones.length < 2 }">
              <canvas id="evolutionChart"></canvas>
            </div>
          </div>

          <h3 class="font-bold text-gray-800 ml-1 mb-3 mt-6">Historial de Consultas</h3>
          <div class="space-y-3">
            <div v-for="medicion in [...mediciones].reverse()" :key="medicion.id" class="glass-card history-card">
              <div class="history-header">
                <span class="history-date">{{ formatFecha(medicion.fecha) }}</span>
                <span class="history-weight font-bold text-brand-600">{{ medicion.peso }} kg</span>
              </div>
              <div class="history-details mt-2 text-xs text-gray-500 flex gap-4">
                <span v-if="medicion.imc">IMC: {{ medicion.imc }}</span>
                <span v-if="medicion.cintura">Cintura: {{ medicion.cintura }} cm</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

const router = useRouter()
const paciente = ref(null)
const datosPaciente = ref(null)
const expediente = ref(null)
const mediciones = ref([])
const menuActivo = ref(null)

const cargandoGeneral = ref(true)
const tabActiva = ref('inicio')

const diasSemana = [
  { key: 'lunes', label: 'Lunes', corto: 'L' },
  { key: 'martes', label: 'Martes', corto: 'M' },
  { key: 'miercoles', label: 'Miércoles', corto: 'M' },
  { key: 'jueves', label: 'Jueves', corto: 'J' },
  { key: 'viernes', label: 'Viernes', corto: 'V' },
  { key: 'sabado', label: 'Sábado', corto: 'S' },
  { key: 'domingo', label: 'Domingo', corto: 'D' },
]

const diaSeleccionado = ref('lunes')

const tiemposComida = [
  { key: 'desayuno', label: 'Desayuno', icon: '🌅' },
  { key: 'colacion_am', label: 'Colación Mañana', icon: '🍎' },
  { key: 'comida', label: 'Comida', icon: '🍲' },
  { key: 'colacion_pm', label: 'Colación Tarde', icon: '🍌' },
  { key: 'cena', label: 'Cena', icon: '🌙' },
]

const nombreCorto = computed(() => {
  if (!paciente.value?.nombre) return ''
  return paciente.value.nombre.split(' ')[0]
})

const inicialNombre = computed(() => {
  return nombreCorto.value.charAt(0).toUpperCase()
})

const ultimoPeso = computed(() => {
  if (mediciones.value.length === 0) return '--'
  return mediciones.value[mediciones.value.length - 1].peso
})

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}

function isLibreOAyuno(texto) {
  if (!texto) return true
  const lower = texto.toLowerCase()
  return lower.includes('libre') || lower.includes('ayuno') || lower.includes('no aplica') || lower.trim() === ''
}

async function cargarDatosGlobales() {
  cargandoGeneral.value = true
  try {
    const pacienteId = paciente.value.id
    
    // 1. Obtener Datos Generales
    const pRes = await api.get(`/pacientes/${pacienteId}`).catch(() => null)
    if (pRes) datosPaciente.value = pRes

    // 2. Obtener Expediente y Mediciones
    const expRes = await api.get(`/expedientes/paciente/${pacienteId}`).catch(() => null)
    if (expRes) {
      expediente.value = expRes.expediente
      mediciones.value = expRes.mediciones || []
    }

    // 3. Obtener Menú Activo
    const menusRes = await api.get(`/menus/paciente/${pacienteId}`).catch(() => [])
    if (Array.isArray(menusRes) && menusRes.length > 0) {
      menuActivo.value = menusRes[0] // Asumimos que el primero (más reciente) es el activo
    }

  } catch (err) {
    console.error('Error cargando portal:', err)
  } finally {
    cargandoGeneral.value = false
  }
}

let chartInstance = null
async function abrirEvolucion() {
  tabActiva.value = 'evolucion'
  if (mediciones.value.length >= 2) {
    await nextTick()
    dibujarGrafica()
  }
}

function dibujarGrafica() {
  const canvas = document.getElementById('evolutionChart')
  if (!canvas) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const fechas = mediciones.value.map(m => formatFecha(m.fecha))
  const pesos = mediciones.value.map(m => m.peso)

  const ctx = canvas.getContext('2d')
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(74, 140, 91, 0.4)')
  gradient.addColorStop(1, 'rgba(74, 140, 91, 0.0)')

  // @ts-ignore (Chart is global from CDN)
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
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: '#f3f4f6', borderDash: [5, 5] },
          ticks: { color: '#6b7280', font: { family: 'Inter' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#6b7280', font: { family: 'Inter' } }
        }
      }
    }
  })
}

function cerrarSesion() {
  localStorage.removeItem('paciente_token')
  localStorage.removeItem('paciente_data')
  router.push('/login')
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
/* ── FUENTES Y VARIABLES GLOBALES ── */
.portal-layout {
  --brand: #4a8c5b;
  --brand-light: #eaf3ed;
  --bg-color: #f7f9f8;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.5);
  --shadow-soft: 0 8px 32px rgba(31, 38, 135, 0.04);
  --shadow-hard: 0 10px 40px rgba(0, 0, 0, 0.08);
  
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background-color: var(--bg-color);
  background-image: 
    radial-gradient(at 0% 0%, rgba(74,140,91,0.06) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(74,140,91,0.03) 0px, transparent 50%);
  color: #1f2937;
  padding-bottom: 80px;
}

/* ── ANIMACIONES GLOBALES ── */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── GLASSMORPHISM HEADER ── */
.glass-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem 1.25rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand), #346841);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.25);
}

.greeting {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.logout-btn {
  color: #9ca3af;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s;
  background: transparent;
  border: none;
}

.logout-btn:hover {
  background: #f3f4f6;
  color: #ef4444;
}

/* ── MAIN CONTENT ── */
.portal-main {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.25rem;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: var(--shadow-soft);
  transition: transform 0.2s;
}

/* ── INICIO CARDS ── */
.gradient-card {
  background: linear-gradient(135deg, var(--brand) 0%, #346841 100%);
  color: white;
  border: none;
  box-shadow: 0 10px 25px rgba(74, 140, 91, 0.3);
  position: relative;
  overflow: hidden;
}

.gradient-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.gradient-card h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.gradient-card p {
  font-family: 'Outfit', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.metric-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand);
}

.card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-primary {
  display: inline-block;
  background: var(--brand);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(74, 140, 91, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 140, 91, 0.4);
}

/* ── MENÚ CARDS ── */
.day-selector {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none; 
}
.day-selector::-webkit-scrollbar {
  display: none;
}

.day-btn {
  background: var(--glass-bg);
  border: 1px solid #e5e7eb;
  min-width: 44px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5563;
  transition: all 0.2s;
  flex-shrink: 0;
}

.day-btn.active {
  background: var(--brand);
  border-color: var(--brand);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.25);
}

.meal-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid var(--brand);
}

.meal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meal-icon {
  font-size: 1.25rem;
}

.meal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
}

.meal-body {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
  margin-left: 2rem;
}

/* ── EVOLUCIÓN ── */
.chart-wrapper {
  height: 250px;
  width: 100%;
  position: relative;
}

.history-card {
  padding: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

/* ── BOTTOM NAV (TABS) ── */
.portal-tabs-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  padding: 0.5rem 1rem 1.5rem 1rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
}

.portal-tabs {
  display: flex;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-item.active {
  color: var(--brand);
}

.tab-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item.active .tab-icon {
  transform: translateY(-2px) scale(1.1);
}

/* ── LOADER ── */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #6b7280;
  font-size: 0.9rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--brand-light);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
