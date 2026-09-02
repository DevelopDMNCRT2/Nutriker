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
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div class="metric-box">
                <span class="metric-label">Peso</span>
                <span class="metric-value">{{ visitaActiva.medicion.peso }} <small>kg</small></span>
              </div>
              <div class="metric-box">
                <span class="metric-label">IMC & Riesgo</span>
                <span class="metric-value" style="font-size: 1.25rem;">{{ visitaActiva.medicion.imc || '--' }} <small class="font-normal border rounded px-1.5 py-0.5 ml-1 bg-gray-50">{{ visitaActiva.medicion.riesgo_imc || '--' }}</small></span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Meta (Peso Ideal)</span>
                <span class="metric-value" style="font-size: 1.25rem;">{{ rangoPesoIdeal }}</span>
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
                <h1 class="text-2xl font-bold text-brand-700">Plan Nutricional: {{ paciente?.nombre || 'Paciente' }}</h1>
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
                    v-if="hasMeal(diaMenuSeleccionado, tiempo.key)"
                    class="meal-card cursor-pointer hover:border-brand-300 transition-colors"
                    @click="abrirPlatilloModal(getMeal(diaMenuSeleccionado, tiempo.key))"
                  >
                    <div class="meal-header">
                      <span class="meal-icon">{{ tiempo.icon }}</span>
                      <h4 class="meal-title">{{ tiempo.label }}</h4>
                    </div>
                    <div class="meal-body relative pr-6">
                      {{ getMealName(diaMenuSeleccionado, tiempo.key) }}
                      <svg v-if="typeof getMeal(diaMenuSeleccionado, tiempo.key) === 'object'" class="w-4 h-4 text-brand-500 absolute right-0 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Vista para imprimir (Rejilla Semanal Horizontal) -->
              <div class="hidden print-show mt-4">
                <table class="print-table w-full text-[10px] border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 p-1 w-16">Tiempo</th>
                      <th v-for="dia in diasSemana" :key="'th-'+dia.key" class="border border-gray-300 p-1 text-center font-bold">{{ dia.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tiempo in tiemposComida" :key="'tr-'+tiempo.key">
                      <td class="border border-gray-300 p-1 font-bold bg-gray-50 text-center">{{ tiempo.label }}</td>
                      <td v-for="dia in diasSemana" :key="'td-'+dia.key+'-'+tiempo.key" class="border border-gray-300 p-1 align-top">
                        <span v-if="hasMeal(dia.key, tiempo.key)" class="block">
                          <strong>{{ getMealName(dia.key, tiempo.key) }}</strong>
                          <span v-if="typeof getMeal(dia.key, tiempo.key) === 'object' && getMeal(dia.key, tiempo.key).info_nutricional?.kcal" class="block text-[8px] text-gray-500 mt-1">
                            🔥 {{ getMeal(dia.key, tiempo.key).info_nutricional.kcal }} kcal
                          </span>
                        </span>
                        <span v-else class="text-gray-300 text-center block">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </main>
    </div>
    
    <!-- MODAL DETALLE DE PLATILLO -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="modalPlatilloVisible && platilloSeleccionado" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-brand-50/30">
              <div>
                <h3 class="text-xl font-bold text-gray-900 leading-tight pr-4">{{ platilloSeleccionado.nombre || platilloSeleccionado }}</h3>
                <p class="text-sm text-brand-600 font-medium mt-1">Detalles del Platillo</p>
              </div>
              <button @click="modalPlatilloVisible = false" class="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6" v-if="typeof platilloSeleccionado === 'object'">
              <!-- Tabs -->
              <div class="flex border-b border-gray-200 mb-6">
                <button @click="tabActivo = 'info'" :class="['px-4 py-2 font-semibold text-sm border-b-2 transition-colors', tabActivo === 'info' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Información Nutricional</button>
                <button v-if="platilloSeleccionado.receta" @click="tabActivo = 'receta'" :class="['px-4 py-2 font-semibold text-sm border-b-2 transition-colors', tabActivo === 'receta' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Receta y Preparación</button>
                <button v-if="platilloSeleccionado.costos && platilloSeleccionado.costos.length > 0" @click="tabActivo = 'costos'" :class="['px-4 py-2 font-semibold text-sm border-b-2 transition-colors', tabActivo === 'costos' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700']">Costos Aproximados</button>
              </div>
              
              <!-- Tab 1: Info Nutricional -->
              <div v-show="tabActivo === 'info'" class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div class="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                  <span class="block text-2xl mb-1">🔥</span>
                  <span class="block text-xl font-bold text-gray-900">{{ platilloSeleccionado.info_nutricional?.kcal || 0 }}</span>
                  <span class="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mt-1">Kcal</span>
                </div>
                <div class="bg-green-50/50 p-4 rounded-xl text-center border border-green-100">
                  <span class="block text-2xl mb-1">🥩</span>
                  <span class="block text-xl font-bold text-green-700">{{ platilloSeleccionado.info_nutricional?.proteinas || 0 }}g</span>
                  <span class="block text-[10px] uppercase font-bold tracking-wider text-green-600 mt-1">Proteínas</span>
                </div>
                <div class="bg-blue-50/50 p-4 rounded-xl text-center border border-blue-100">
                  <span class="block text-2xl mb-1">🌾</span>
                  <span class="block text-xl font-bold text-blue-700">{{ platilloSeleccionado.info_nutricional?.carbohidratos || 0 }}g</span>
                  <span class="block text-[10px] uppercase font-bold tracking-wider text-blue-600 mt-1">Carbs</span>
                </div>
                <div class="bg-yellow-50/50 p-4 rounded-xl text-center border border-yellow-100">
                  <span class="block text-2xl mb-1">🥑</span>
                  <span class="block text-xl font-bold text-yellow-700">{{ platilloSeleccionado.info_nutricional?.grasas || 0 }}g</span>
                  <span class="block text-[10px] uppercase font-bold tracking-wider text-yellow-600 mt-1">Grasas</span>
                </div>
                <div class="bg-purple-50/50 p-4 rounded-xl text-center border border-purple-100">
                  <span class="block text-2xl mb-1">🥬</span>
                  <span class="block text-xl font-bold text-purple-700">{{ platilloSeleccionado.info_nutricional?.fibra || 0 }}g</span>
                  <span class="block text-[10px] uppercase font-bold tracking-wider text-purple-600 mt-1">Fibra</span>
                </div>
              </div>
              
              <!-- Tab 2: Receta -->
              <div v-show="tabActivo === 'receta'">
                <div class="bg-brand-50/30 p-5 rounded-xl border border-brand-100">
                  <h4 class="font-bold text-brand-800 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                    Instrucciones
                  </h4>
                  <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ platilloSeleccionado.receta }}</p>
                </div>
              </div>
              
              <!-- Tab 3: Costos -->
              <div v-show="tabActivo === 'costos'">
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left font-semibold text-gray-600">Ingrediente</th>
                        <th class="px-4 py-3 text-right font-semibold text-gray-600">Costo Estimado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(item, idx) in platilloSeleccionado.costos" :key="idx" class="hover:bg-gray-50/50">
                        <td class="px-4 py-3 text-gray-800">{{ item.ingrediente }}</td>
                        <td class="px-4 py-3 text-right font-medium text-gray-900">${{ item.precio?.toFixed(2) || '0.00' }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="bg-gray-50/80 font-bold border-t border-gray-200">
                      <tr>
                        <td class="px-4 py-3 text-right text-gray-600">Total Aproximado:</td>
                        <td class="px-4 py-3 text-right text-brand-700">${{ calcularCostoTotal(platilloSeleccionado.costos) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div v-else class="p-6 text-center text-gray-500">
              <p>Este platillo es un texto simple y no contiene detalles extendidos.</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

const modalPlatilloVisible = ref(false)
const platilloSeleccionado = ref(null)
const tabActivo = ref('info')

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

function getMeal(diaKey, tiempoKey) {
  if (!visitaActiva.value?.menu) return null
  return visitaActiva.value.menu[`${diaKey}_${tiempoKey}`]
}

function getMealName(diaKey, tiempoKey) {
  const meal = getMeal(diaKey, tiempoKey)
  if (!meal) return ''
  return typeof meal === 'object' ? meal.nombre : meal
}

function hasMeal(diaKey, tiempoKey) {
  const meal = getMeal(diaKey, tiempoKey)
  if (!meal) return false
  const name = typeof meal === 'object' ? meal.nombre : meal
  if (!name) return false
  const lower = name.toLowerCase()
  return !(lower.includes('libre') || lower.includes('ayuno') || lower.includes('no aplica') || lower.trim() === '')
}

function isLibreOAyuno(texto) {
  if (!texto) return true
  const lower = (typeof texto === 'object' ? texto.nombre : texto).toLowerCase()
  return lower.includes('libre') || lower.includes('ayuno') || lower.includes('no aplica') || lower.trim() === ''
}

function abrirPlatilloModal(mealData) {
  if (!mealData || typeof mealData !== 'object') return
  platilloSeleccionado.value = mealData
  tabActivo.value = 'info'
  modalPlatilloVisible.value = true
}

function calcularCostoTotal(costos) {
  if (!costos || !Array.isArray(costos)) return '0.00'
  const t = costos.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0)
  return t.toFixed(2)
}

// Transformar datos en "Visitas"
const visitas = computed(() => {
  const sortedMediciones = [...mediciones.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  
  return sortedMediciones.map(m => {
    let menuAsignado = allMenus.value.find(menu => menu.semanaInicio === m.fecha)
    if (!menuAsignado && allMenus.value.length > 0) {
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

const rangoPesoIdeal = computed(() => {
  if (!visitaActiva.value || !datosPaciente.value) return '--'
  const m = visitaActiva.value.medicion
  const talla = m.talla || datosPaciente.value.estatura
  const sexo = datosPaciente.value.sexo || 'Femenino'
  
  if (!talla) return '--'
  
  if (sexo === 'Hombre' || sexo === 'Masculino') {
    const min = (talla * talla * 21.5).toFixed(1)
    const max = (talla * talla * 24).toFixed(1)
    return `${min} - ${max} kg`
  } else {
    const min = (talla * talla * 25).toFixed(1)
    const max = (talla * talla * 26).toFixed(1)
    return `${min} - ${max} kg`
  }
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
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  position: sticky;
  top: 2rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  opacity: 0.6;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 0.35rem;
  top: 2rem;
  bottom: -0.5rem;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item.active,
.timeline-item:hover {
  opacity: 1;
}

.timeline-dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: #d1d5db;
  margin-top: 0.3rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-dot {
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-light);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.timeline-date {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
}

.timeline-weight {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  display: inline-block;
  width: max-content;
}

.timeline-item.active .timeline-weight {
  background: var(--brand-light);
  color: var(--brand);
}

/* ── CARDS GLOBALES ── */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  padding: 1.75rem;
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
  color: #111827;
  margin: 0;
}

.badge-date {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-light);
  padding: 0.4rem 0.75rem;
  border-radius: 99px;
}

/* ── INFO BOXES (Diag / Notas) ── */
.info-box {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 1rem;
  padding: 1.25rem;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

/* ── METRICS (Biométricos) ── */
.metric-box {
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.metric-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand);
}
.metric-value small {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 500;
}

.chart-wrapper {
  height: 200px;
  width: 100%;
  margin-top: 1rem;
}

/* ── MENU DAY SELECTOR ── */
.day-selector {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-btn {
  flex: 1;
  min-width: 80px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.6rem 0;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.day-btn:hover {
  background: #f9fafb;
}

.day-btn.active {
  background: var(--brand);
  color: white;
  border-color: var(--brand);
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.2);
}

/* ── MEALS CONTAINER ── */
.meals-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.meal-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.meal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.meal-icon {
  font-size: 1.2rem;
}

.meal-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.meal-body {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

/* ── BOTONES ── */
.btn-outline-primary {
  display: inline-flex;
  align-items: center;
  background: white;
  color: var(--brand);
  border: 2px solid var(--brand);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline-primary:hover {
  background: var(--brand);
  color: white;
}

/* ── IMPRESIÓN (PRINT) ── */
@media print {
  @page {
    size: landscape;
    margin: 10mm;
  }
  
  body {
    background-color: white !important;
    font-size: 10pt;
  }

  .print-hide { display: none !important; }
  .print-show { display: block !important; }

  .menu-print-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }

  .print-grid {
    display: block !important;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 9pt;
  }
  
  .print-table th, .print-table td {
    border: 1px solid #cbd5e1;
    padding: 4px;
  }
  
  .print-table th {
    background-color: #f1f5f9 !important;
    -webkit-print-color-adjust: exact;
  }
  
  .print-table td {
    background-color: #ffffff !important;
    -webkit-print-color-adjust: exact;
  }
}
</style>
