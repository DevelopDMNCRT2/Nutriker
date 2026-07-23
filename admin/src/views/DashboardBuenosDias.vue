<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- ── 1. Header Banner "Buenos Días" ────────────────────────────── -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 p-6 md:p-8 text-white shadow-lg">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md mb-2">
              <CalenderIcon class="w-4 h-4 text-white" />
              <span>{{ fechaFormateada }}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
              {{ datosDashboard.saludo || '¡Buenos días, Dra. Karla!' }}
            </h1>
            <p class="mt-1 text-sm text-white/90 max-w-xl">
              Aquí tienes el resumen de tu jornada médica de hoy. Tienes <strong class="underline decoration-brand-200 font-semibold">{{ datosDashboard.totalCitasHoy }} cita(s) agendada(s)</strong> para el día de hoy.
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <router-link
              to="/citas"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-sm hover:bg-brand-50 transition-colors"
            >
              <CalenderIcon class="w-4 h-4 text-brand-600" />
              <span>Ver Calendario</span>
            </router-link>
            <router-link
              to="/clientes"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ListIcon class="w-4 h-4 text-white" />
              <span>Expedientes</span>
            </router-link>
          </div>
        </div>
        
        <!-- Elemento decorativo de fondo -->
        <div class="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      <!-- ── 2. Tarjetas de Indicadores Rápidos (KPIs) ─────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Citas Hoy -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Citas de Hoy</span>
            <div class="rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <CalenderIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ datosDashboard.totalCitasHoy }}</span>
            <span class="text-xs text-gray-500">consultas</span>
          </div>
          <p class="mt-1 text-xs text-brand-600 font-medium dark:text-brand-400">Programadas para hoy</p>
        </div>

        <!-- Total Expedientes -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Expedientes Clientes</span>
            <div class="rounded-lg bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
              <ListIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ datosDashboard.totalClientes }}</span>
            <span class="text-xs text-gray-500">pacientes</span>
          </div>
          <p class="mt-1 text-xs text-teal-600 font-medium dark:text-teal-400">Registrados en sistema</p>
        </div>

        <!-- Total Citas Acumuladas -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Total Consultas</span>
            <div class="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <BarChartIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ datosDashboard.totalCitas }}</span>
            <span class="text-xs text-gray-500">históricas</span>
          </div>
          <p class="mt-1 text-xs text-indigo-600 font-medium dark:text-indigo-400">Histórico en plataforma</p>
        </div>

        <!-- Estado del Día -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado Agenda</span>
            <div class="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <SuccessIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400">Al Día</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">Servidor y DB PostgreSQL activos</p>
        </div>
      </div>

      <!-- ── 3. Cronograma del Día + Pendientes ────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cronograma Citas del Día (2 Columnas) -->
        <div class="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalenderIcon class="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Agenda Cronológica de Hoy</span>
              </h2>
              <p class="text-xs text-gray-500">Ordenadas por horario de atención</p>
            </div>
            <router-link to="/citas" class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
              + Nueva Cita
            </router-link>
          </div>

          <!-- Estado si no hay citas hoy -->
          <div v-if="datosDashboard.citasHoy && datosDashboard.citasHoy.length === 0" class="py-12 text-center">
            <div class="mx-auto w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-3 dark:bg-brand-500/10 dark:text-brand-400">
              <CalenderIcon class="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 class="text-sm font-semibold text-gray-800 dark:text-white">No tienes citas agendadas para hoy</h3>
            <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Disfruta tu jornada o aprovecha para revisar expedientes clínicos de pacientes anteriores.</p>
            <router-link to="/citas" class="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
              Agendar una Cita
            </router-link>
          </div>

          <!-- Lista de Citas de Hoy -->
          <div v-else class="space-y-3">
            <div
              v-for="cita in datosDashboard.citasHoy"
              :key="cita.id"
              class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-200 transition-all dark:border-gray-800 dark:bg-gray-800/40 dark:hover:bg-gray-800"
            >
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-center justify-center w-16 h-12 rounded-lg bg-brand-50 text-brand-700 font-bold dark:bg-brand-500/10 dark:text-brand-300">
                  <span class="text-xs font-semibold text-brand-500 uppercase">Hora</span>
                  <span class="text-sm">{{ cita.horario }}</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ cita.cliente_nombre }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">📞 {{ cita.cliente_telefono || 'Sin teléfono' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span
                  class="px-2.5 py-1 text-[11px] font-semibold rounded-full"
                  :class="cita.atencion_previa === 'si' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300'"
                >
                  {{ cita.atencion_previa === 'si' ? 'Seguimiento' : 'Primera Consulta' }}
                </span>
                <router-link to="/citas" class="text-xs font-medium text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Ver ➔
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Tareas y Recordatorios Diarios (1 Columna) -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TaskIcon class="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Pendientes del Día</span>
            </h2>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {{ tareasLocales.filter(t => !t.completada).length }} pendientes
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="tarea in tareasLocales"
              :key="tarea.id"
              @click="toggleTarea(tarea)"
              class="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/60 transition-colors dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                :checked="tarea.completada"
                class="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
              />
              <span
                class="text-xs font-medium leading-relaxed transition-all"
                :class="tarea.completada ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'"
              >
                {{ tarea.texto }}
              </span>
            </div>
          </div>

          <!-- Recordatorio médico -->
          <div class="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40">
            <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs mb-1">
              <InfoCircleIcon class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Recordatorio Clínico</span>
            </div>
            <p class="text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
              Recuerda sanitizar y validar que los expedientes de las citas de hoy incluyan el motivo de consulta completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { dashboardApi } from '@/api/index.js'
import { CalenderIcon, ListIcon, TaskIcon, InfoCircleIcon, BarChartIcon, SuccessIcon } from '@/icons'

const loading = ref(true)
const datosDashboard = ref<any>({
  saludo: '¡Buenos días, Dra. Karla!',
  totalCitasHoy: 0,
  totalCitas: 0,
  totalClientes: 0,
  citasHoy: [],
  tareas: [],
})

const tareasLocales = ref<any[]>([])

const fechaFormateada = computed(() => {
  const hoy = new Date()
  return hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

async function cargarDashboard() {
  loading.value = true
  try {
    const res = await dashboardApi.getResumenDiario()
    datosDashboard.value = res
    // Limpiar emojis residuales si vienen en el saludo del backend
    if (datosDashboard.value.saludo) {
      datosDashboard.value.saludo = datosDashboard.value.saludo.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
    }
    tareasLocales.value = res.tareas || []
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

function toggleTarea(tarea: any) {
  tarea.completada = !tarea.completada
}

onMounted(() => {
  cargarDashboard()
})
</script>
