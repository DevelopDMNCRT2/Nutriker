<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Regresar & Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <router-link to="/pacientes" class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 mb-1">
            ← Regresar a Expedientes
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
            <span>Expediente Clínico Digital</span>
            <span v-if="paciente && paciente.nombre" class="text-xl font-medium text-brand-600 dark:text-brand-400">
              — {{ paciente.nombre }}
            </span>
          </h1>
        </div>

        <div class="flex items-center gap-3">

          <button
            @click="abrirModalMedicion"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nueva Medición</span>
          </button>
        </div>
      </div>

      <!-- Datos del Paciente (Tarjeta Principal) -->
      <div v-if="paciente" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-6 dark:border-gray-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xl dark:bg-brand-500/10 dark:text-brand-300">
              {{ paciente.nombre ? paciente.nombre.substring(0, 2).toUpperCase() : 'PA' }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ paciente.nombre }}</h2>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>{{ paciente.telefono || 'Sin teléfono' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.correo || 'Sin correo' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.edad ? `${paciente.edad} años` : 'Edad N/D' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.ocupacion || 'Ocupación N/D' }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <div class="bg-gray-50 p-3 rounded-xl dark:bg-gray-800/50">
              <span class="block text-gray-400 font-medium">Estatura</span>
              <span class="font-bold text-gray-900 dark:text-white text-sm">{{ paciente.estatura ? `${paciente.estatura} m` : '1.65 m' }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl dark:bg-gray-800/50">
              <span class="block text-gray-400 font-medium">Peso Inicial</span>
              <span class="font-bold text-gray-900 dark:text-white text-sm">{{ paciente.peso ? `${paciente.peso} kg` : 'N/D' }}</span>
            </div>
            <div class="bg-brand-50 p-3 rounded-xl dark:bg-brand-500/10">
              <span class="block text-brand-600 font-medium dark:text-brand-400">Último Peso</span>
              <span class="font-bold text-brand-700 dark:text-brand-300 text-sm">{{ ultimoPeso }} kg</span>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs border-t border-gray-100 dark:border-gray-800 pt-4">
          <div>
            <span class="font-bold text-gray-700 dark:text-gray-300">Diagnóstico Clínico (IA):</span>
            <p class="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">{{ expediente.diagnostico || 'Evaluación inicial en curso.' }}</p>
          </div>
          <div>
            <span class="font-bold text-gray-700 dark:text-gray-300">Objetivo Nutricional (IA):</span>
            <p class="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">{{ expediente.objetivoNutricional || 'Optimizar composición corporal.' }}</p>
          </div>
          <div>
            <span class="font-bold text-gray-700 dark:text-gray-300">Notas Médicas y Observaciones (IA):</span>
            <p class="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">{{ expediente.notasMedicas || 'Sin observaciones guardadas.' }}</p>
          </div>
        </div>
      </div>

      <!-- Gráfica de Evolución Antropométrica (ApexCharts) -->
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              Evolución Histórica (Peso, Grasa & Músculo)
            </h3>
          </div>
        </div>

        <!-- Renderizado de Gráfica ApexCharts -->
        <div v-if="seriesGráfica[0].data.length > 0" class="w-full h-72">
          <apexchart
            type="line"
            height="280"
            :options="opcionesGrafica"
            :series="seriesGráfica"
          />
        </div>
        <div v-else class="py-12 text-center text-xs text-gray-400">
          No hay mediciones suficientes para generar la gráfica de evolución.
        </div>
      </div>

      <!-- Tabla Histórica de Mediciones -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Registro Detallado de Consultas</h3>
          <span class="text-xs text-gray-500">{{ mediciones.length }} consulta(s) evaluada(s)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Peso (kg)</th>
                <th class="px-4 py-3">Grasa (%)</th>
                <th class="px-4 py-3">Músculo (kg)</th>
                <th class="px-4 py-3">Agua (%)</th>
                <th class="px-4 py-3">Cintura / Cadera</th>
                <th class="px-4 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-if="mediciones.length === 0" class="text-center">
                <td colspan="7" class="py-6 text-gray-400">Sin mediciones registradas.</td>
              </tr>
              <tr v-for="m in mediciones" :key="m.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">{{ m.fecha }}</td>
                <td class="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">{{ m.peso }} kg</td>
                <td class="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">{{ m.porcentajeGrasa ? `${m.porcentajeGrasa}%` : '-' }}</td>
                <td class="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{{ m.cintura ? `${m.cintura}cm` : '-' }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ m.abdomen ? `${m.abdomen}cm` : '-' }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {{ m.cintura ? `${m.cintura}cm` : '-' }} / {{ m.cadera ? `${m.cadera}cm` : '-' }}
                </td>
                <td class="px-4 py-3 text-gray-500 truncate max-w-xs">{{ m.observaciones || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Registrar Nueva Medición (Wizard 2 Pasos) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalMedicionVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarModalMedicion"></div>
            <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 z-10 max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Nueva Medición</h3>
                <button @click="cerrarModalMedicion" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
              </div>

              <!-- PASO 1: TOMA DE DATOS -->
              <div v-if="stepMedicion === 1" class="space-y-4 text-xs py-4">
                <p class="text-gray-500 mb-2">Paso 1: Captura de Datos Clínicos</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Consulta *</label>
                    <input v-model="formMedicion.fecha" type="date" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Peso en Kg *</label>
                    <input v-model="formMedicion.peso" type="number" step="0.1" placeholder="Ej. 72.5" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Talla en mts</label>
                    <input v-model="formMedicion.talla" type="number" step="0.01" placeholder="Ej. 1.68" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo relaj (cm)</label>
                    <input v-model="formMedicion.brazoRelajado" type="number" step="0.1" placeholder="Ej. 28" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo flex (cm)</label>
                    <input v-model="formMedicion.brazoFlexionado" type="number" step="0.1" placeholder="Ej. 30" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cintura en cm</label>
                    <input v-model="formMedicion.cintura" type="number" step="0.1" placeholder="Ej. 84.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Abdómen en cms</label>
                    <input v-model="formMedicion.abdomen" type="number" step="0.1" placeholder="Ej. 88.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cadera en cms</label>
                    <input v-model="formMedicion.cadera" type="number" step="0.1" placeholder="Ej. 97.5" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Muslo (cm)</label>
                    <input v-model="formMedicion.muslo" type="number" step="0.1" placeholder="Ej. 55.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Pantorrilla (cm)</label>
                    <input v-model="formMedicion.pantorrilla" type="number" step="0.1" placeholder="Ej. 38.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                    <input v-model="formMedicion.observaciones" type="text" placeholder="Notas adicionales..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800 mt-4">
                  <button @click="cerrarModalMedicion" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                    Cancelar
                  </button>
                  <button @click="stepMedicion = 2" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Siguiente →
                  </button>
                </div>
              </div>

              <!-- PASO 2: FÓRMULAS Y RESULTADOS -->
              <div v-if="stepMedicion === 2" class="space-y-4 text-sm py-4">
                <p class="text-brand-600 font-semibold mb-4 border-l-4 border-brand-500 pl-3">Paso 2: Aplicación de Fórmulas y Diagnóstico</p>
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    <em>Nota: Los valores aquí mostrados son placeholders (N/D) hasta que la Dra. nos confirme la fórmula exacta que utiliza para calcular los índices y riesgos dependiendo de los datos del paciente.</em>
                  </p>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span class="block text-gray-500 text-xs uppercase tracking-wider font-bold">IMC Calculado:</span>
                      <span class="text-lg font-bold text-gray-900 dark:text-white">N/D</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase tracking-wider font-bold">Índice C/C:</span>
                      <span class="text-lg font-bold text-gray-900 dark:text-white">N/D</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase tracking-wider font-bold">Riesgo de IMC:</span>
                      <span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pendiente de fórmula</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase tracking-wider font-bold">Riesgo de C/C:</span>
                      <span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pendiente de fórmula</span>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between border-t border-gray-100 pt-4 mt-4 dark:border-gray-800">
                  <button @click="stepMedicion = 1" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                    ← Volver
                  </button>
                  <div class="flex gap-2">
                    <button @click="guardarMedicion" :disabled="saving" class="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-theme-sm">
                      {{ saving ? 'Guardando...' : 'Aplicar Fórmula y Guardar' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { pacientesApi, expedientesApi } from '@/api/index.js'
import { BarChartIcon, PlusIcon } from '@/icons'
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const route = useRoute()
const pacienteId = ref<string>(route.params.pacienteId as string || '35135447')

const loading = ref(true)
const saving = ref(false)

const paciente = ref<any>(null)
const expediente = ref<any>({})
const mediciones = ref<any[]>([])

const pacienteName = computed(() => paciente.value?.nombre || 'Cargando...')

const modalMedicionVisible = ref(false)
const stepMedicion = ref(1)

const formMedicion = ref({
  fecha: new Date().toISOString().split('T')[0],
  peso: '',
  talla: '',
  brazoRelajado: '',
  brazoFlexionado: '',
  cintura: '',
  abdomen: '',
  cadera: '',
  muslo: '',
  pantorrilla: '',
  observaciones: '',
})

const ultimoPeso = computed(() => {
  if (mediciones.value.length > 0) {
    return mediciones.value[mediciones.value.length - 1].peso
  }
  return paciente.value?.peso || 'N/D'
})

// Opciones de configuración para ApexCharts
const opcionesGrafica = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  colors: ['#4A8C5B', '#D97706', '#4F46E5'],
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 5 },
  xaxis: {
    categories: mediciones.value.map(m => m.fecha),
    labels: { style: { colors: '#6B7280', fontSize: '11px' } },
  },
  yaxis: {
    labels: { style: { colors: '#6B7280', fontSize: '11px' } },
  },
  grid: { borderColor: '#F3F4F6' },
  tooltip: { theme: 'light' },
}))

const seriesGráfica = computed(() => [
  {
    name: 'Peso (kg)',
    data: mediciones.value.map(m => parseFloat(m.peso)),
  },
  {
    name: 'Cintura (cm)',
    data: mediciones.value.map(m => parseFloat(m.cintura || 0)),
  },
  {
    name: 'Cadera (cm)',
    data: mediciones.value.map(m => parseFloat(m.cadera || 0)),
  },
])

async function cargarExpediente() {
  loading.value = true
  try {
    const targetId = (route.params.pacienteId as string) || pacienteId.value || '35135447'
    pacienteId.value = targetId

    const [pacienteRes, expRes] = await Promise.all([
      pacientesApi.getById(targetId).catch(() => null),
      expedientesApi.getByPaciente(targetId),
    ])

    paciente.value = pacienteRes
    expediente.value = expRes.expediente
    mediciones.value = expRes.mediciones || []
    
    // Auto-abrir el modal si es la primera vez (0 mediciones)
    if (mediciones.value.length === 0) {
      abrirModalMedicion()
    }
  } catch (err) {
    console.error('Error al cargar expediente clínico:', err)
  } finally {
    loading.value = false
  }
}

function abrirModalMedicion() {
  formMedicion.value = {
    fecha: new Date().toISOString().split('T')[0],
    peso: '',
    talla: '',
    brazoRelajado: '',
    brazoFlexionado: '',
    cintura: '',
    abdomen: '',
    cadera: '',
    muslo: '',
    pantorrilla: '',
    observaciones: '',
  }
  stepMedicion.value = 1
  modalMedicionVisible.value = true
}

function cerrarModalMedicion() {
  modalMedicionVisible.value = false
}

async function guardarMedicion() {
  if (!formMedicion.value.peso) return

  saving.value = true
  try {
    const idPaciente = (route.params.pacienteId as string) || pacienteId.value || '22014468'
    const body = {
      pacienteId: idPaciente,
      fecha: formMedicion.value.fecha || new Date().toISOString().split('T')[0],
      peso: parseFloat(formMedicion.value.peso),
      talla: formMedicion.value.talla ? parseFloat(formMedicion.value.talla) : null,
      brazoRelajado: formMedicion.value.brazoRelajado ? parseFloat(formMedicion.value.brazoRelajado) : null,
      brazoFlexionado: formMedicion.value.brazoFlexionado ? parseFloat(formMedicion.value.brazoFlexionado) : null,
      cintura: formMedicion.value.cintura ? parseFloat(formMedicion.value.cintura) : null,
      abdomen: formMedicion.value.abdomen ? parseFloat(formMedicion.value.abdomen) : null,
      cadera: formMedicion.value.cadera ? parseFloat(formMedicion.value.cadera) : null,
      muslo: formMedicion.value.muslo ? parseFloat(formMedicion.value.muslo) : null,
      pantorrilla: formMedicion.value.pantorrilla ? parseFloat(formMedicion.value.pantorrilla) : null,
      // Los calculados aún se mandan null porque faltan las fórmulas,
      // o pueden calcularse aquí en un futuro.
      observaciones: formMedicion.value.observaciones || '',
    }

    await expedientesApi.createMedicion(body)
    await cargarExpediente()
    cerrarModalMedicion()
  } catch (err: any) {
    console.error('Error al guardar medición:', err)
    alert(err.message || 'Error al guardar la medición')
  } finally {
    saving.value = false
  }
}

watch(
  () => route.params.pacienteId,
  (newId) => {
    if (newId) {
      pacienteId.value = newId as string
      cargarExpediente()
    }
  }
)

onMounted(() => {
  cargarExpediente()
})
</script>
