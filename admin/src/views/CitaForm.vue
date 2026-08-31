<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Cita Médica' : 'Agendar Nueva Cita'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Cita' : 'Agendar Cita'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Autocompletado del paciente -->
          <div class="sm:col-span-2 relative">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre del Paciente *</label>
            <input
              v-model="form.paciente_nombre"
              type="text"
              required
              placeholder="Escribe para buscar paciente o ingresar nuevo..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              @focus="showDropdownPacientes = true"
              @input="showDropdownPacientes = true; patientSelectedFromDropdown = false; proceedAsNew = false"
            />
            <div
              v-if="showDropdownPacientes && pacientesFiltrados.length > 0"
              class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
            >
              <div
                v-for="paciente in pacientesFiltrados"
                :key="paciente.id"
                @mousedown.prevent="seleccionarPaciente(paciente)"
                class="cursor-pointer px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
              >
                <div>
                  <p class="text-xs font-bold text-gray-800 dark:text-white">{{ paciente.nombre }}</p>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ paciente.telefono }} <span v-if="paciente.correo">• {{ paciente.correo }}</span></p>
                </div>
                <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">Paciente Registrado</span>
              </div>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Teléfono *</label>
            <input
              v-model="form.paciente_telefono"
              type="text"
              required
              maxlength="10"
              placeholder="0000000000"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input
              v-model="form.paciente_correo"
              type="email"
              placeholder="ejemplo@correo.com"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Fecha de Consulta *</label>
            <input
              v-model="form.fecha"
              type="date"
              :min="todayCDMX"
              required
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Horario Disponible *</label>
            <select
              v-model="form.horario"
              required
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="" disabled>Seleccionar horario</option>
              <option v-for="h in HORARIOS" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">¿Atención Previa?</label>
            <select
              v-model="form.atencion_previa"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="no">No (Primera Vez)</option>
              <option value="si">Sí (Subsecuente)</option>
            </select>
          </div>
        </div>
      </FormSection>
    </div>

    <!-- Duplicate Warning Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDuplicateWarning" class="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4" @click.self="showDuplicateWarning = false">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all">
            <div class="flex items-center gap-4 mb-4 text-amber-600">
              <div class="p-3 bg-amber-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h2 class="text-xl font-bold">Paciente Posiblemente Duplicado</h2>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Hemos encontrado pacientes ya registrados con un nombre muy similar al que introdujiste. Para mantener tu base de datos limpia y no duplicar expedientes, te sugerimos seleccionar uno de la lista si se trata de la misma persona:
            </p>
            <div class="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="candidato in duplicateCandidates" :key="candidato.id" class="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-amber-50 transition-colors">
                <div class="mb-2 sm:mb-0">
                  <p class="font-bold text-gray-800 dark:text-white">{{ candidato.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ candidato.telefono }} <span v-if="candidato.correo">• {{ candidato.correo }}</span></p>
                </div>
                <button @click="usarPacienteSugerido(candidato)" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
                  Usar este paciente
                </button>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button @click="showDuplicateWarning = false" class="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                Volver
              </button>
              <button @click="ignorarAdvertencia" class="px-5 py-2 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-bold transition-colors">
                Ignorar y crear nuevo
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
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormSection from '@/components/common/FormSection.vue'
import { citasApi, pacientesApi } from '@/api/index.js'

const HORARIOS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30'
]

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const listaPacientes = ref<any[]>([])
const showDropdownPacientes = ref(false)

const todayCDMX = computed(() => {
  const options = { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' } as const
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(new Date())
  return `${parts.find(p=>p.type==='year')?.value}-${parts.find(p=>p.type==='month')?.value}-${parts.find(p=>p.type==='day')?.value}`
})

const citaId = computed(() => route.params.id as string)
const isEditing = computed(() => !!citaId.value)

// Estado validación de duplicados
const showDuplicateWarning = ref(false)
const duplicateCandidates = ref<any[]>([])
const proceedAsNew = ref(false)
const patientSelectedFromDropdown = ref(false)

const form = ref({
  paciente_nombre: '',
  paciente_telefono: '',
  paciente_correo: '',
  fecha: new Date().toISOString().split('T')[0],
  horario: '10:00',
  atencion_previa: 'no'
})

const pacientesFiltrados = computed(() => {
  try {
    const nombre = form.value.paciente_nombre || ''
    const query = String(nombre).toLowerCase().trim()
    const lista = Array.isArray(listaPacientes.value) ? listaPacientes.value : ((listaPacientes.value as any).data || [])
    
    if (!query) return lista.slice(0, 5)
    
    return lista.filter((c: any) => {
      const nom = c.nombre ? String(c.nombre).toLowerCase() : ''
      const tel = c.telefono ? String(c.telefono) : ''
      return nom.includes(query) || tel.includes(query)
    }).slice(0, 5)
  } catch (e) {
    return []
  }
})

function seleccionarPaciente(paciente: any) {
  form.value.paciente_nombre = paciente.nombre || ''
  form.value.paciente_telefono = paciente.telefono || ''
  form.value.paciente_correo = paciente.correo || ''
  form.value.atencion_previa = 'si'
  showDropdownPacientes.value = false
  patientSelectedFromDropdown.value = true
}

function usarPacienteSugerido(paciente: any) {
  seleccionarPaciente(paciente)
  showDuplicateWarning.value = false
  proceedAsNew.value = true
  guardar()
}

function ignorarAdvertencia() {
  showDuplicateWarning.value = false
  proceedAsNew.value = true
  guardar()
}

onMounted(async () => {
  try {
    const data = await pacientesApi.getAll(1, 1000)
    listaPacientes.value = data.data || data || []
  } catch (e) {}

  if (isEditing.value) {
    try {
      const data = await citasApi.getById(citaId.value)
      if (data) {
        form.value.paciente_nombre = data.nombre || data.paciente_nombre || ''
        form.value.paciente_telefono = data.telefono || data.paciente_telefono || ''
        form.value.fecha = data.fecha ? data.fecha.split('T')[0] : ''
        form.value.horario = data.horario || '10:00'
        form.value.atencion_previa = data.atencion_previa || (data.tipo === 'Subsecuente' ? 'si' : 'no')
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos de la cita'
    }
  }
})

async function guardar() {
  saving.value = true
  errorMsg.value = ''
  
  // Validación de duplicados (solo al crear)
  if (!isEditing.value && !proceedAsNew.value && !patientSelectedFromDropdown.value) {
    const query = String(form.value.paciente_nombre).toLowerCase().trim()
    const lista = Array.isArray(listaPacientes.value) ? listaPacientes.value : ((listaPacientes.value as any).data || [])
    
    const posibles = lista.filter((c: any) => {
      const nom = c.nombre ? String(c.nombre).toLowerCase() : ''
      return nom.includes(query) || query.includes(nom)
    })
    
    if (posibles.length > 0) {
      duplicateCandidates.value = posibles.slice(0, 5)
      showDuplicateWarning.value = true
      saving.value = false
      return
    }
  }

  try {
    const payload: any = { ...form.value }
    payload.nombre = payload.paciente_nombre
    payload.telefono = payload.paciente_telefono
    delete payload.paciente_nombre
    delete payload.paciente_telefono
    
    if (!payload.paciente_correo) {
      delete payload.paciente_correo
    } else {
      payload.correo = payload.paciente_correo
      delete payload.paciente_correo
    }
    if (isEditing.value) {
      await citasApi.update(citaId.value, payload)
    } else {
      await citasApi.create(payload)
    }
    router.push('/citas')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al agendar cita'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/citas')
}
</script>
