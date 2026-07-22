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

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando citas...</p>
      </div>

      <!-- Calendar -->
      <div v-else class="calendar-wrapper">
        <FullCalendar :options="calendarOptions" ref="calendarRef" />
      </div>
    </div>

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
                    v-model="form.cliente_nombre"
                    type="text"
                    placeholder="Ej. Ana Sofía Montenegro"
                    class="form-input"
                    @focus="showDropdownClientes = true; loadClientesSearch()"
                    @input="showDropdownClientes = true"
                  />
                  <!-- Dropdown de búsqueda de clientes -->
                  <div
                    v-if="clientesFiltrados.length > 0"
                    class="absolute left-0 right-0 top-[100%] mt-1 z-50 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
                  >
                    <div
                      v-for="cliente in clientesFiltrados"
                      :key="cliente.id"
                      @mousedown.prevent="seleccionarCliente(cliente)"
                      class="cursor-pointer px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ cliente.nombre }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ cliente.telefono }} <span v-if="cliente.correo">• {{ cliente.correo }}</span></p>
                      </div>
                      <span class="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">Cliente Registrado</span>
                    </div>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Teléfono * <span style="font-weight:400;font-size:11px;color:#94a3b8;">(10 dígitos)</span></label>
                  <input v-model="form.cliente_telefono" type="tel" placeholder="0000000000" class="form-input" maxlength="10" @input="sanitizeTelefono" />
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
            <p>Esta acción no se puede deshacer. La cita de <strong>{{ form.cliente_nombre }}</strong> del <strong>{{ formatDateDisplay(form.fecha) }}</strong> a las <strong>{{ form.horario }}</strong> será eliminada.</p>
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
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { citasApi, clientesApi } from '@/api/index.js'

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
const listaClientes = ref<any[]>([])
const showDropdownClientes = ref(false)

const HORARIOS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30'
]

const defaultForm = () => ({
  id: null as string | null,
  cliente_nombre: '',
  cliente_telefono: '',
  fecha: '',
  horario: '',
  atencion_previa: 'no',
  peso: '',
  estatura: '',
})
const form = ref(defaultForm())
const horariosDisponibles = ref([...HORARIOS])

// --- Búsqueda / Autocomplete de Clientes ---
async function loadClientesSearch() {
  if (listaClientes.value.length === 0) {
    try {
      listaClientes.value = await clientesApi.getAll()
    } catch {
      listaClientes.value = []
    }
  }
}

const clientesFiltrados = computed(() => {
  const query = form.value.cliente_nombre.toLowerCase().trim()
  if (!query || !showDropdownClientes.value) return []
  return listaClientes.value.filter(c =>
    (c.nombre && c.nombre.toLowerCase().includes(query)) ||
    (c.telefono && c.telefono.includes(query))
  ).slice(0, 5)
})

function seleccionarCliente(cliente: any) {
  form.value.cliente_nombre = cliente.nombre
  if (cliente.telefono) form.value.cliente_telefono = cliente.telefono
  if (cliente.peso) form.value.peso = String(cliente.peso)
  if (cliente.estatura) form.value.estatura = String(cliente.estatura)
  form.value.atencion_previa = 'si'
  showDropdownClientes.value = false
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

// --- Eventos Demo (expedientes de ejemplo de Clientes) ---
const citasDemo = [
  {
    id: 'demo-1',
    cliente_nombre: 'Ana Sofía Montenegro',
    cliente_telefono: '5544221100',
    fecha: '2026-04-14',
    horario: '10:30',
    atencion_previa: 'no',
    peso: 72.5,
    estatura: 163,
    _demo: true,
  },
  {
    id: 'demo-2',
    cliente_nombre: 'Fernando Rafael Orozco',
    cliente_telefono: '3311998800',
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
      title: `${c.horario} · ${c.cliente_nombre}`,
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
      title: `${c.horario} · ${c.cliente_nombre}`,
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
  initialView: 'dayGridMonth',
  displayEventTime: false,
  slotDuration: '00:30:00',
  slotMinTime: '08:00:00',
  slotMaxTime: '18:00:00',
  slotEventOverlap: false,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    list: 'Lista',
  },
  events: calendarEvents.value,
  eventContent: (arg: any) => {
    const isTimeGrid = arg.view.type.startsWith('timeGrid')
    const nombre = arg.event.extendedProps.cliente_nombre || ''
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
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  nowIndicator: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDidMount: (info: any) => {
    info.el.title = `${info.event.extendedProps.cliente_nombre}\n${info.event.extendedProps.cliente_telefono}\n${info.event.extendedProps.horario}`
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
  const props = clickInfo.event.extendedProps
  isEditing.value = true
  form.value = {
    id: clickInfo.event.id,
    cliente_nombre: props.cliente_nombre || '',
    cliente_telefono: props.cliente_telefono || '',
    fecha: props.fecha?.split('T')[0] || '',
    horario: props.horario || '',
    atencion_previa: props.atencion_previa || 'no',
    peso: props.peso || '',
    estatura: props.estatura || '',
  }
  showModal.value = true
  loadHorariosOcupados(form.value.fecha)
}

function openCreateModal() {
  resetForm()
  isEditing.value = false
  showModal.value = true
  horariosOcupados.value = []
}

function closeModal() {
  showModal.value = false
  modalError.value = ''
  resetForm()
}

function resetForm() {
  form.value = defaultForm()
  showDropdownClientes.value = false
}

async function onFechaChange() {
  await loadHorariosOcupados(form.value.fecha)
}

async function saveCita() {
  modalError.value = ''
  if (!form.value.cliente_nombre || !form.value.cliente_telefono || !form.value.fecha || !form.value.horario) {
    modalError.value = 'Por favor completa todos los campos obligatorios.'
    return
  }
  saving.value = true
  try {
    const payload = {
      cliente_nombre: form.value.cliente_nombre,
      cliente_telefono: form.value.cliente_telefono,
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
  form.value.cliente_telefono = form.value.cliente_telefono.replace(/[^0-9]/g, '').slice(0, 10)
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
