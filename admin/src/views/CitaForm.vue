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
              v-model="form.cliente_nombre"
              type="text"
              required
              placeholder="Escribe para buscar paciente o ingresar nuevo..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              @focus="showDropdownClientes = true"
              @input="showDropdownClientes = true"
            />
            <div
              v-if="showDropdownClientes && clientesFiltrados.length > 0"
              class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
            >
              <div
                v-for="cliente in clientesFiltrados"
                :key="cliente.id"
                @mousedown.prevent="seleccionarCliente(cliente)"
                class="cursor-pointer px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
              >
                <div>
                  <p class="text-xs font-bold text-gray-800 dark:text-white">{{ cliente.nombre }}</p>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ cliente.telefono }} <span v-if="cliente.correo">• {{ cliente.correo }}</span></p>
                </div>
                <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">Paciente Registrado</span>
              </div>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Teléfono *</label>
            <input
              v-model="form.cliente_telefono"
              type="text"
              required
              maxlength="10"
              placeholder="0000000000"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Fecha de Consulta *</label>
            <input
              v-model="form.fecha"
              type="date"
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
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormSection from '@/components/common/FormSection.vue'
import { citasApi, clientesApi } from '@/api/index.js'

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
const listaClientes = ref<any[]>([])
const showDropdownClientes = ref(false)

const citaId = computed(() => route.params.id as string)
const isEditing = computed(() => !!citaId.value)

const form = ref({
  cliente_nombre: '',
  cliente_telefono: '',
  fecha: new Date().toISOString().split('T')[0],
  horario: '10:00',
  atencion_previa: 'no'
})

const clientesFiltrados = computed(() => {
  if (!form.value.cliente_nombre || form.value.cliente_nombre.trim() === '') {
    return listaClientes.value.slice(0, 5)
  }
  const q = form.value.cliente_nombre.toLowerCase()
  return listaClientes.value.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(q)) || 
    (c.telefono && c.telefono.includes(q))
  ).slice(0, 5)
})

function seleccionarCliente(cliente: any) {
  form.value.cliente_nombre = cliente.nombre || ''
  form.value.cliente_telefono = cliente.telefono || ''
  showDropdownClientes.value = false
}

onMounted(async () => {
  try {
    listaClientes.value = await clientesApi.getAll()
  } catch (e) {}

  if (isEditing.value) {
    try {
      const data = await citasApi.getById(citaId.value)
      if (data) {
        form.value.cliente_nombre = data.nombre || data.cliente_nombre || ''
        form.value.cliente_telefono = data.telefono || data.cliente_telefono || ''
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
  try {
    if (isEditing.value) {
      await citasApi.update(citaId.value, form.value)
    } else {
      await citasApi.create(form.value)
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
