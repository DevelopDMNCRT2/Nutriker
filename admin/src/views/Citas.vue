<template>
  <AdminLayout>
    <div class="citas-container">
      <!-- Header -->
      <div class="citas-header">
        <div class="header-left">
          <h1 class="page-title">Citas</h1>
          <p class="page-subtitle">Gestión de agenda y citas de la clínica</p>
        </div>
        <div class="header-right">
          <button class="btn-importar" @click="openImportModal" style="margin-right: 12px; background-color: #6366f1; color: white; padding: 10px 16px; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar Lista (IA)
          </button>
          <button class="btn-nueva-cita" @click="openCreateModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar" v-if="!loading">
        <div class="stat-card">
          <span class="stat-number">{{ totalCitas }}</span>
          <span class="stat-label">Total Citas</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ citasHoy }}</span>
          <span class="stat-label">Hoy</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ citasSemana }}</span>
          <span class="stat-label">Esta Semana</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ citasMes }}</span>
          <span class="stat-label">Este Mes</span>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <LoadingSkeleton v-if="loading" :rows="5" type="table" class="my-6" />

      <!-- Calendar -->
      <div v-else class="calendar-wrapper">
        <FullCalendar :options="calendarOptions" ref="calendarRef" />
      </div>
    </div>

    <!-- Modal Importar Citas IA -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showImportModal" class="modal-overlay" @click.self="closeImportModal">
          <div class="modal-card">
            <div class="modal-header">
              <h2 class="modal-title" style="color: #6366f1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Importador Mágico con IA
              </h2>
              <button class="modal-close" @click="closeImportModal" :disabled="importing">✕</button>
            </div>
            <div class="modal-body">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Sube un documento (PDF, Excel, Word o CSV) con la lista de personas a agendar. La IA de Gemini analizará el documento y acomodará las citas automáticamente en los horarios libres.</p>
              
              <div v-if="importing" class="flex flex-col items-center justify-center py-8">
                <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p class="text-sm font-semibold text-indigo-600">La IA está analizando el documento y agendando...</p>
              </div>

              <div v-else class="form-group full-width">
                <input type="file" @change="handleFileUpload" accept=".pdf,.xlsx,.xls,.csv,.docx" class="form-input" style="padding: 12px;" />
              </div>
            </div>
            <div class="modal-footer" v-if="!importing">
              <button class="btn-cancel" @click="closeImportModal">Cancelar</button>
              <button class="btn-submit" @click="uploadImportFile" :disabled="!importFile" style="background-color: #6366f1;">
                Procesar Documento
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Cita -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="actionModalVisible" class="modal-overlay" @click.self="actionModalVisible = false">
          <div class="modal-card !max-w-md p-8">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedEvent?.extendedProps.paciente_nombre }}</h2>
              <p class="text-sm font-medium text-gray-500 mt-1">{{ selectedEvent?.extendedProps.fecha }} a las {{ selectedEvent?.extendedProps.horario }} hrs</p>
            </div>
            
            <div class="flex flex-col gap-3">
              <button @click="comenzarCita" class="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Comenzar Consulta (Expediente)
              </button>
              <button @click="editarCitaAction" class="w-full flex items-center justify-center gap-2 bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar Cita
              </button>
              <button @click="actionModalVisible = false" class="w-full font-bold py-3.5 px-4 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Cita -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-header">
              <h2 class="modal-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ isEditing ? 'Editar Cita' : 'Nueva Cita' }}
              </h2>
              <button class="modal-close" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-body">
              <div v-if="modalError" class="form-error-banner">{{ modalError }}</div>

              <div class="form-grid">
                <div class="form-group full-width relative">
                  <label>Nombre del Paciente *</label>
                  <input
                    v-model="form.paciente_nombre"
                    type="text"
                    placeholder="Ej. Ana Sofía Montenegro"
                    class="form-input"
                    @focus="showDropdownPacientes = true; loadPacientesSearch()"
                    @input="showDropdownPacientes = true"
                  />
                  <!-- Dropdown de búsqueda de pacientes -->
                  <div
                    v-if="pacientesFiltrados.length > 0"
                    class="absolute left-0 right-0 top-[100%] mt-1 z-50 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
                  >
                    <div
                      v-for="paciente in pacientesFiltrados"
                      :key="paciente.id"
                      @mousedown.prevent="seleccionarPaciente(paciente)"
                      class="cursor-pointer px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ paciente.nombre }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ paciente.telefono }} <span v-if="paciente.correo">• {{ paciente.correo }}</span></p>
                      </div>
                      <span class="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">Paciente Registrado</span>
                    </div>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Teléfono * <span style="font-weight:400;font-size:11px;color:#94a3b8;">(10 dígitos)</span></label>
                  <input v-model="form.paciente_telefono" type="tel" placeholder="0000000000" class="form-input" maxlength="10" @input="sanitizeTelefono" />
                </div>
                <div class="form-group">
                  <label>Fecha *</label>
                  <input v-model="form.fecha" type="date" class="form-input" @change="onFechaChange" />
                </div>
                <div class="form-group">
                  <label>Horario *</label>
                  <select v-model="form.horario" class="form-input form-select">
                    <option value="" disabled>Seleccionar horario</option>
                    <option
                      v-for="h in horariosDisponibles"
                      :key="h"
                      :value="h"
                      :disabled="horariosOcupados.includes(h) && form.horario !== h"
                    >
                      {{ h }} {{ horariosOcupados.includes(h) && form.horario !== h ? '(Ocupado)' : '' }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Atención Previa</label>
                  <select v-model="form.atencion_previa" class="form-input form-select">
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Peso (kg)</label>
                  <input v-model="form.peso" type="number" step="0.1" min="0" max="999" placeholder="Ej. 65" class="form-input" @input="sanitizePeso" />
                </div>
                <div class="form-group">
                  <label>Estatura (cm)</label>
                  <input v-model="form.estatura" type="number" step="1" min="0" max="999" placeholder="Ej. 165" class="form-input" @input="sanitizeEstatura" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button v-if="isEditing" class="btn-delete" @click="confirmDelete" :disabled="saving">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                Eliminar
              </button>
              <div class="footer-right">
                <button class="btn-cancel" @click="closeModal" :disabled="saving">Cancelar</button>
                <button class="btn-save" @click="saveCita" :disabled="saving">
                  <span v-if="saving" class="spinner-sm"></span>
                  <span>{{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cita') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirmDelete" class="modal-overlay" @click.self="showConfirmDelete = false">
          <div class="modal-card confirm-modal">
            <div class="confirm-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>¿Eliminar esta cita?</h3>
            <p>Esta acción no se puede deshacer. La cita de <strong>{{ form.paciente_nombre }}</strong> del <strong>{{ formatDateDisplay(form.fecha) }}</strong> a las <strong>{{ form.horario }}</strong> será eliminada.</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="showConfirmDelete = false">Cancelar</button>
              <button class="btn-delete-confirm" @click="deleteCita" :disabled="saving">
                {{ saving ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import { citasApi, pacientesApi } from '@/api/index.js'

const router = useRouter()
const route = useRoute()

// --- State ---
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showConfirmDelete = ref(false)
const isEditing = ref(false)
const modalError = ref('')
const calendarRef = ref(null)
const allCitas = ref<any[]>([])
const horariosOcupados = ref<string[]>([])
const listaPacientes = ref<any[]>([])
const showDropdownPacientes = ref(false)

// Estado del Modal de Acción
const actionModalVisible = ref(false)
const selectedEvent = ref<any>(null)

// Estado del Importador IA
const showImportModal = ref(false)
const importFile = ref<File | null>(null)
const importing = ref(false)

function openImportModal() {
  importFile.value = null
  showImportModal.value = true
}

function closeImportModal() {
  if (importing.value) return
  showImportModal.value = false
}

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0]
  }
}

async function uploadImportFile() {
  if (!importFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('archivo', importFile.value)
    const result = await citasApi.importar(formData)
    alert(result.message || 'Importación exitosa.')
    closeImportModal()
    await loadCitas()
  } catch (err: any) {
    console.error('Error importando:', err)
    alert(err.message || 'Error al importar archivo.')
  } finally {
    importing.value = false
  }
}

const HORARIOS = [
  '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', '13:20', '14:00',
  '15:20', '16:00', '16:40'
]

const defaultForm = () => ({
  id: null as string | null,
  paciente_nombre: '',
  paciente_telefono: '',
  fecha: '',
  horario: '',
  atencion_previa: 'no',
  peso: '',
  estatura: '',
})
const form = ref(defaultForm())
const horariosDisponibles = ref([...HORARIOS])

// --- Búsqueda / Autocomplete de Pacientes ---
async function loadPacientesSearch() {
  if (listaPacientes.value.length === 0) {
    try {
      listaPacientes.value = await pacientesApi.getAll()
    } catch {
      listaPacientes.value = []
    }
  }
}

const pacientesFiltrados = computed(() => {
  const query = form.value.paciente_nombre.toLowerCase().trim()
  if (!query || !showDropdownPacientes.value) return []
  return listaPacientes.value.filter(c =>
    (c.nombre && c.nombre.toLowerCase().includes(query)) ||
    (c.telefono && c.telefono.includes(query))
  ).slice(0, 5)
})

function seleccionarPaciente(paciente: any) {
  form.value.paciente_nombre = paciente.nombre
  if (paciente.telefono) form.value.paciente_telefono = paciente.telefono
  if (paciente.peso) form.value.peso = String(paciente.peso)
  if (paciente.estatura) form.value.estatura = String(paciente.estatura)
  form.value.atencion_previa = 'si'
  showDropdownPacientes.value = false
}

// --- Stats ---
const today = new Date().toISOString().split('T')[0]

const todasLasCitas = computed(() => [...allCitas.value, ...citasDemo])

const totalCitas = computed(() => todasLasCitas.value.length)
const citasHoy = computed(() => todasLasCitas.value.filter(c => (c.fecha?.split('T')[0] ?? c.fecha) === today).length)
const citasSemana = computed(() => {
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)
  return todasLasCitas.value.filter(c => {
    const f = c.fecha?.split('T')[0] ?? c.fecha
    const d = new Date(f + 'T12:00:00')
    return d >= weekStart && d <= weekEnd
  }).length
})
const citasMes = computed(() => {
  const now = new Date()
  return todasLasCitas.value.filter(c => {
    const f = c.fecha?.split('T')[0] ?? c.fecha
    const d = new Date(f + 'T12:00:00')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})

// --- Eventos Demo (expedientes de ejemplo de Pacientes) ---
const citasDemo = [
  {
    id: 'demo-1',
    paciente_nombre: 'Ana Sofía Montenegro',
    paciente_telefono: '5544221100',
    fecha: '2026-04-14',
    horario: '10:30',
    atencion_previa: 'no',
    peso: 72.5,
    estatura: 163,
    _demo: true,
  },
  {
    id: 'demo-2',
    paciente_nombre: 'Fernando Rafael Orozco',
    paciente_telefono: '3311998800',
    fecha: '2026-04-17',
    horario: '14:00',
    atencion_previa: 'si',
    peso: 88.0,
    estatura: 180,
    _demo: true,
  },
]

// Helper para calcular 30 min de duración en las citas para el TimeGrid de FullCalendar
function calcularFinHorario(horario: string) {
  if (!horario || !horario.includes(':')) return '08:30'
  const [hStr, mStr] = horario.split(':')
  let h = parseInt(hStr, 10)
  let m = parseInt(mStr, 10) + 30
  if (m >= 60) {
    m -= 60
    h += 1
  }
  const hh = h < 10 ? `0${h}` : `${h}`
  const mm = m < 10 ? `0${m}` : `${m}`
  return `${hh}:${mm}`
}

// --- Calendar events (API + demo) ---
const calendarEvents = computed(() => {
  const apiEvents = allCitas.value.map(c => {
    const f = c.fecha?.split('T')[0] ?? c.fecha
    const fin = calcularFinHorario(c.horario)
    return {
      id: c.id,
      title: `${c.horario} · ${c.paciente_nombre}`,
      start: `${f}T${c.horario}:00`,
      end: `${f}T${fin}:00`,
      extendedProps: { ...c },
      backgroundColor: c.atencion_previa === 'si' ? '#33AAAE' : '#4A8C5B',
      borderColor: c.atencion_previa === 'si' ? '#28898C' : '#3a7048',
      textColor: '#ffffff',
    }
  })

  const demoEvents = citasDemo.map(c => {
    const f = c.fecha?.split('T')[0] ?? c.fecha
    const fin = calcularFinHorario(c.horario)
    return {
      id: c.id,
      title: `${c.horario} · ${c.paciente_nombre}`,
      start: `${f}T${c.horario}:00`,
      end: `${f}T${fin}:00`,
      extendedProps: { ...c },
      backgroundColor: c.atencion_previa === 'si' ? '#33AAAE' : '#4A8C5B',
      borderColor: c.atencion_previa === 'si' ? '#28898C' : '#3a7048',
      textColor: '#ffffff',
      classNames: ['demo-event'],
    }
  })

  return [...apiEvents, ...demoEvents]
})

// --- FullCalendar Options ---
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  locale: esLocale,
  initialView: route.query.vista === 'hoy' ? 'listDay' : 'dayGridMonth',
  initialDate: new Date().toISOString().split('T')[0],
  displayEventTime: false,
  slotDuration: '00:40:00',
  slotMinTime: '08:40:00',
  slotMaxTime: '17:20:00',
  slotEventOverlap: false,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek,listDay',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    list: 'Lista',
    day: 'Día',
  },
  events: calendarEvents.value,
  eventContent: (arg: any) => {
    const isTimeGrid = arg.view.type.startsWith('timeGrid')
    const nombre = arg.event.extendedProps.paciente_nombre || ''
    const horario = arg.event.extendedProps.horario || ''

    if (isTimeGrid) {
      return {
        html: `<div class="fc-custom-event-content"><span class="font-semibold">${nombre}</span></div>`
      }
    }
    return {
      html: `<div class="fc-custom-event-content"><span>${horario} · ${nombre}</span></div>`
    }
  },
  editable: true,
  droppable: true,
  dragRevertDuration: 100,
  dragScroll: true,
  eventStartEditable: true,
  eventDurationEditable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  nowIndicator: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventDrop,
  eventDidMount: (info: any) => {
    info.el.title = `${info.event.extendedProps.paciente_nombre}\n${info.event.extendedProps.paciente_telefono}\n${info.event.extendedProps.horario}`
  },
}))

// --- API ---
async function loadCitas() {
  loading.value = true
  try {
    const data = await citasApi.getAll()
    allCitas.value = data
  } catch (e: any) {
    console.error('Error al cargar citas:', e.message)
  } finally {
    loading.value = false
  }
}

async function loadHorariosOcupados(fecha: string) {
  if (!fecha) { horariosOcupados.value = []; return }
  try {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const res = await fetch(`${API_BASE}/citas/horarios-ocupados?fecha=${fecha}`)
    const data = await res.json()
    // Excluir el horario de la cita actual si estamos editando
    const ocupados = (data.ocupados || []).filter((h: string) => {
      if (isEditing.value && h === form.value.horario) return false
      return true
    })
    horariosOcupados.value = ocupados
  } catch {
    horariosOcupados.value = []
  }
}

// --- Handlers ---
function handleDateSelect(selectInfo: any) {
  const fecha = selectInfo.startStr.split('T')[0]
  resetForm()
  form.value.fecha = fecha
  isEditing.value = false
  showModal.value = true
  loadHorariosOcupados(fecha)
}

function handleEventClick(clickInfo: any) {
  selectedEvent.value = clickInfo.event
  actionModalVisible.value = true
}

function editarCitaAction() {
  actionModalVisible.value = false
  if (selectedEvent.value) {
    router.push(`/citas/editar/${selectedEvent.value.id}`)
  }
}

async function comenzarCita() {
  if (!selectedEvent.value) return
  const cita = selectedEvent.value.extendedProps
  actionModalVisible.value = false
  
  try {
    // Buscar si ya existe el paciente registrado
    await loadPacientesSearch()
    const match = listaPacientes.value.find(c => c.nombre.toLowerCase() === cita.paciente_nombre.toLowerCase() || c.cita_id === cita.id)
    
    if (match) {
      router.push(`/expedientes/${match.id}`)
    } else {
      // Pasar data por query param a nuevo paciente
      router.push({
        path: '/pacientes/nuevo',
        query: {
          cita_id: cita.id,
          nombre: cita.paciente_nombre,
          telefono: cita.paciente_telefono
        }
      })
    }
  } catch (err) {
    console.error('Error al comenzar cita:', err)
  }
}

async function handleEventDrop(dropInfo: any) {
  const event = dropInfo.event
  const props = event.extendedProps

  // Ya se permiten mover las citas demo para pruebas del usuario
  /*
  if (props._demo || String(event.id).startsWith('demo-')) {
    alert('Las citas de muestra no pueden ser reagendadas.')
    dropInfo.revert()
    return
  }
  */

  const startDate = event.start
  if (!startDate) {
    dropInfo.revert()
    return
  }

  const year = startDate.getFullYear()
  const month = String(startDate.getMonth() + 1).padStart(2, '0')
  const day = String(startDate.getDate()).padStart(2, '0')
  const newFecha = `${year}-${month}-${day}`

  const hours = String(startDate.getHours()).padStart(2, '0')
  const minutes = String(startDate.getMinutes()).padStart(2, '0')
  let newHorario = `${hours}:${minutes}`

  // Si se mueve en la vista mensual, mantener el horario original si el nuevo es 00:00
  if (newHorario === '00:00' && props.horario) {
    newHorario = props.horario
  }

  const payload = {
    paciente_nombre: props.paciente_nombre,
    paciente_telefono: props.paciente_telefono,
    fecha: newFecha,
    horario: newHorario,
    atencion_previa: props.atencion_previa || 'no',
    peso: props.peso || null,
    estatura: props.estatura || null,
  }

  try {
    await citasApi.update(event.id, payload)
    await loadCitas()
  } catch (e: any) {
    alert(e.message || 'El horario seleccionado ya se encuentra reservado.')
    dropInfo.revert()
  }
}

function openCreateModal() {
  router.push('/citas/nuevo')
}

function closeModal() {
  showModal.value = false
  modalError.value = ''
  resetForm()
}

function resetForm() {
  form.value = defaultForm()
  showDropdownPacientes.value = false
}

async function onFechaChange() {
  await loadHorariosOcupados(form.value.fecha)
}

async function saveCita() {
  modalError.value = ''
  if (!form.value.paciente_nombre || !form.value.paciente_telefono || !form.value.fecha || !form.value.horario) {
    modalError.value = 'Por favor completa todos los campos obligatorios.'
    return
  }
  saving.value = true
  try {
    const payload = {
      paciente_nombre: form.value.paciente_nombre,
      paciente_telefono: form.value.paciente_telefono,
      fecha: form.value.fecha,
      horario: form.value.horario,
      atencion_previa: form.value.atencion_previa,
      peso: form.value.peso || null,
      estatura: form.value.estatura || null,
    }
    if (isEditing.value && form.value.id) {
      await citasApi.update(form.value.id, payload)
    } else {
      await citasApi.create(payload)
    }
    await loadCitas()
    closeModal()
  } catch (e: any) {
    modalError.value = e.message || 'Error al guardar la cita.'
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  showConfirmDelete.value = true
}

async function deleteCita() {
  if (!form.value.id) return
  saving.value = true
  try {
    await citasApi.delete(form.value.id)
    await loadCitas()
    showConfirmDelete.value = false
    closeModal()
  } catch (e: any) {
    modalError.value = e.message || 'Error al eliminar la cita.'
    showConfirmDelete.value = false
  } finally {
    saving.value = false
  }
}

function formatDateDisplay(fecha: string) {
  if (!fecha) return ''
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// --- Sanitizers de campos ---
function sanitizeTelefono() {
  form.value.paciente_telefono = form.value.paciente_telefono.replace(/[^0-9]/g, '').slice(0, 10)
}

function sanitizePeso() {
  const parts = String(form.value.peso).split('.')
  if (parts[0].length > 3) {
    form.value.peso = parts[0].slice(0, 3) + (parts[1] !== undefined ? '.' + parts[1] : '')
  }
}

function sanitizeEstatura() {
  const val = String(form.value.estatura).split('.')[0]
  if (val.length > 3) {
    form.value.estatura = val.slice(0, 3)
  }
}

onMounted(loadCitas)
</script>

<style scoped>
/* ======== CONTAINER ======== */
.citas-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 80px);
}

/* ======== HEADER ======== */
.citas-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.2;
}
.dark .page-title { color: #f1f5f9; }
.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
}
.dark .page-subtitle { color: #94a3b8; }
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-nueva-cita {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4A8C5B, #3a7048);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.3);
}
.btn-nueva-cita:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(74, 140, 91, 0.4);
}
.btn-nueva-cita:active { transform: translateY(0); }

/* ======== STATS BAR ======== */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.dark .stat-card {
  background: #1e293b;
  border-color: #334155;
}
.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #4A8C5B;
  line-height: 1;
}
.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dark .stat-label { color: #94a3b8; }

/* ======== LOADING ======== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #64748b;
  gap: 12px;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #4A8C5B;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ======== CALENDAR WRAPPER ======== */
.calendar-wrapper {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.dark .calendar-wrapper {
  background: #1e293b;
  border-color: #334155;
}

/* FullCalendar overrides */
.calendar-wrapper :deep(.fc) {
  font-family: inherit;
}
.calendar-wrapper :deep(.fc-toolbar-title) {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  text-transform: capitalize;
}
.dark .calendar-wrapper :deep(.fc-toolbar-title) { color: #f1f5f9; }

.calendar-wrapper :deep(.fc-button) {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  color: #374151 !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  padding: 6px 14px !important;
  transition: all 0.15s ease !important;
  box-shadow: none !important;
  text-transform: capitalize !important;
}
.calendar-wrapper :deep(.fc-button:hover) {
  background: #f8fafc !important;
  border-color: #4A8C5B !important;
  color: #4A8C5B !important;
}
.calendar-wrapper :deep(.fc-button-active),
.calendar-wrapper :deep(.fc-button-primary:not(:disabled):active),
.calendar-wrapper :deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background: #4A8C5B !important;
  border-color: #4A8C5B !important;
  color: white !important;
}
.dark .calendar-wrapper :deep(.fc-button) {
  background: #334155 !important;
  border-color: #475569 !important;
  color: #e2e8f0 !important;
}
.dark .calendar-wrapper :deep(.fc-button-active) {
  background: #4A8C5B !important;
  border-color: #4A8C5B !important;
  color: white !important;
}
.calendar-wrapper :deep(.fc-col-header-cell-cushion) {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
}
.calendar-wrapper :deep(.fc-daygrid-day-number) {
  font-size: 13px;
  color: #374151;
  text-decoration: none;
  padding: 4px 8px;
}
.dark .calendar-wrapper :deep(.fc-daygrid-day-number) { color: #cbd5e1; }
.calendar-wrapper :deep(.fc-daygrid-day.fc-day-today) {
  background: rgba(74, 140, 91, 0.06) !important;
}
.calendar-wrapper :deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background: #4A8C5B;
  color: white;
  border-radius: 50%;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}
.calendar-wrapper :deep(.fc-daygrid-event) {
  border-radius: 8px !important;
  padding: 4px 6px !important;
  margin: 2px !important;
  background-color: #4A8C5B !important;
  border: 1px solid #3a7048 !important;
  box-shadow: 0 2px 6px rgba(74, 140, 91, 0.25) !important;
  transition: all 0.15s ease !important;
  cursor: pointer !important;
}
.calendar-wrapper :deep(.fc-timegrid-event) {
  border-radius: 6px !important;
  padding: 2px 4px !important;
  margin: 1px 2px !important;
  background-color: #4A8C5B !important;
  border: 1px solid #3a7048 !important;
  box-shadow: 0 1px 4px rgba(74, 140, 91, 0.2) !important;
  transition: all 0.15s ease !important;
  cursor: pointer !important;
  max-height: 100% !important;
  overflow: hidden !important;
}
.calendar-wrapper :deep(.fc-daygrid-event:hover),
.calendar-wrapper :deep(.fc-timegrid-event:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.4) !important;
  opacity: 0.95 !important;
}
.calendar-wrapper :deep(.fc-event-dragging),
.calendar-wrapper :deep(.fc-event-resizing) {
  transition: none !important;
  cursor: grabbing !important;
  opacity: 0.92 !important;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.3) !important;
  z-index: 9999 !important;
  transform: scale(1.03) !important;
}
.calendar-wrapper :deep(.fc-timegrid-event-harness) {
  margin: 1px 2px !important;
}
.calendar-wrapper :deep(.fc-event-main) {
  color: #ffffff !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  text-align: center !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}
.calendar-wrapper :deep(.fc-custom-event-content) {
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-wrapper :deep(.fc-highlight) {
  background: rgba(74, 140, 91, 0.12) !important;
}
.calendar-wrapper :deep(.fc-daygrid-more-link) {
  font-size: 11px;
  color: #4A8C5B;
  font-weight: 600;
}
.calendar-wrapper :deep(.fc-list-day-cushion) {
  background: #f8fafc !important;
}
.dark .calendar-wrapper :deep(.fc-list-day-cushion) {
  background: #1e293b !important;
}
.calendar-wrapper :deep(table) {
  border-color: #e2e8f0 !important;
}
.dark .calendar-wrapper :deep(table),
.dark .calendar-wrapper :deep(td),
.dark .calendar-wrapper :deep(th) {
  border-color: #334155 !important;
}
.calendar-wrapper :deep(.fc-now-indicator-line) {
  border-color: #ef4444 !important;
}
.calendar-wrapper :deep(.demo-event) {
  border-style: dashed !important;
  border-width: 1.5px !important;
  opacity: 0.85;
}

/* ======== MODAL ======== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}
.modal-card {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.dark .modal-card {
  background: #1e293b;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.dark .modal-header { border-bottom-color: #334155; }
.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}
.dark .modal-title { color: #f1f5f9; }
.modal-title svg { color: #33AAAE; }
.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  display: flex;
}
.modal-close:hover { color: #374151; background: #f1f5f9; }
.dark .modal-close:hover { color: #e2e8f0; background: #334155; }

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.form-error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.dark .form-group label { color: #94a3b8; }
.form-input {
  padding: 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #1a202c;
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #33AAAE;
  box-shadow: 0 0 0 3px rgba(51,170,174,0.12);
}
.dark .form-input {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
}
.dark .form-input:focus { border-color: #33AAAE; }
.form-select { appearance: none; cursor: pointer; }

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  gap: 10px;
}
.dark .modal-footer { border-top-color: #334155; }
.footer-right { display: flex; gap: 10px; align-items: center; }

.btn-cancel {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  color: #374151;
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { background: #f1f5f9; }
.dark .btn-cancel { background: #334155; border-color: #475569; color: #cbd5e1; }
.btn-save {
  background: linear-gradient(135deg, #33AAAE, #2a9194);
  color: white;
  border: none;
  padding: 9px 22px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(51,170,174,0.3);
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(51,170,174,0.4); }
.btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-delete {
  background: none;
  border: 1.5px solid #fecaca;
  color: #dc2626;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-delete:hover { background: #fef2f2; }
.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ======== CONFIRM MODAL ======== */
.confirm-modal {
  max-width: 380px;
  padding: 32px;
  text-align: center;
  gap: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.confirm-icon svg { color: #f59e0b; }
.confirm-modal h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}
.dark .confirm-modal h3 { color: #f1f5f9; }
.confirm-modal p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
.dark .confirm-modal p { color: #94a3b8; }
.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}
.btn-delete-confirm {
  background: #dc2626;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-delete-confirm:hover { background: #b91c1c; }
.btn-delete-confirm:disabled { opacity: 0.65; cursor: not-allowed; }

/* ======== MODAL TRANSITIONS ======== */
.modal-enter-active, .modal-leave-active { transition: all 0.22s ease; }
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.modal-enter-from .modal-card, .modal-leave-to .modal-card {
  transform: scale(0.95) translateY(8px);
}
</style>
