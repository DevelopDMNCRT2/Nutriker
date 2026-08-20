<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Registro de Ingreso' : 'Registrar Nuevo Pago / Ingreso'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Ingreso' : 'Registrar Ingreso'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="space-y-4 text-xs">
          <!-- Fecha y Método de Pago -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Fecha del Registro *</label>
              <input
                v-model="form.fecha"
                type="date"
                required
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Método de Pago *</label>
              <select
                v-model="form.metodo_pago"
                required
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta / En línea">Tarjeta / En línea</option>
                <option value="Transferencia">Transferencia bancaria</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <!-- Concepto -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Concepto del Pago *</label>
            <input
              v-model="form.concepto"
              type="text"
              required
              placeholder="Ej. Consulta nutricional presencial, Conferencia de nutrición clínica..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <!-- A Nombre De (con Autocompletado de Pacientes) y Recibe -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="relative">
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">A Nombre De (Paciente / Paciente) *</label>
              <input
                v-model="form.a_nombre_de"
                type="text"
                required
                placeholder="Escribe para buscar paciente o ingresar entidad..."
                @focus="mostrarSugerencias = true"
                @input="mostrarSugerencias = true"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <!-- Dropdown de Sugerencias de Pacientes Registrados -->
              <div
                v-if="mostrarSugerencias && sugerenciasPacientes.length > 0"
                class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div
                  v-for="paciente in sugerenciasPacientes"
                  :key="paciente.id"
                  @mousedown.prevent="seleccionarPaciente(paciente)"
                  class="cursor-pointer rounded-lg px-3 py-2 text-xs hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center justify-between"
                >
                  <span class="font-medium text-gray-900 dark:text-white">{{ paciente.nombre }}</span>
                  <span class="text-[10px] text-gray-400 font-mono">{{ paciente.telefono }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Recibe (Atendido por) *</label>
              <input
                v-model="form.recibe"
                type="text"
                required
                placeholder="Dra. Alexa Lora"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <!-- Cantidad ($ MXN) -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Monto del Ingreso ($ MXN) *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">$</span>
              <input
                v-model.number="form.cantidad"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full rounded-xl border border-gray-300 bg-transparent pl-8 pr-3.5 py-2.5 text-xs font-bold text-emerald-600 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-emerald-400"
              />
            </div>
          </div>

          <!-- Notas Adicionales -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Notas u Observaciones</label>
            <textarea
              v-model="form.notas"
              rows="3"
              placeholder="Detalles adicionales del pago o recibo..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
        </div>
      </FormSection>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import FormSection from '../components/common/FormSection.vue'
import { ingresosApi, pacientesApi } from '../api'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const errorMsg = ref('')

const pacientesList = ref([])
const mostrarSugerencias = ref(false)

const form = ref({
  fecha: new Date().toISOString().split('T')[0],
  concepto: '',
  a_nombre_de: '',
  recibe: 'Dra. Alexa Lora',
  cantidad: null,
  metodo_pago: 'Efectivo',
  notas: ''
})

const sugerenciasPacientes = computed(() => {
  if (!form.value.a_nombre_de || form.value.a_nombre_de.trim() === '') return []
  const query = form.value.a_nombre_de.toLowerCase().trim()
  return pacientesList.value.filter(c =>
    c.nombre && c.nombre.toLowerCase().includes(query)
  ).slice(0, 5)
})

const seleccionarPaciente = (paciente) => {
  form.value.a_nombre_de = paciente.nombre
  mostrarSugerencias.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    mostrarSugerencias.value = false
  }
}

onMounted(async () => {
  window.addEventListener('click', handleClickOutside)

  // Cargar lista de pacientes para autocompletado sugerido
  try {
    pacientesList.value = await pacientesApi.getAll()
  } catch (err) {
    console.error('Error al cargar lista de pacientes sugeridos:', err)
  }

  if (isEditing.value) {
    try {
      const data = await ingresosApi.getById(route.params.id)
      if (data) {
        form.value = {
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          concepto: data.concepto || '',
          a_nombre_de: data.a_nombre_de || '',
          recibe: data.recibe || 'Dra. Alexa Lora',
          cantidad: Number(data.cantidad) || 0,
          metodo_pago: data.metodo_pago || 'Efectivo',
          notas: data.notas || ''
        }
      }
    } catch (err) {
      errorMsg.value = 'Error al cargar los datos del ingreso.'
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const guardar = async () => {
  try {
    saving.value = true
    errorMsg.value = ''

    if (!form.value.concepto || !form.value.a_nombre_de || form.value.cantidad === null || form.value.cantidad === undefined) {
      errorMsg.value = 'Por favor completa todos los campos obligatorios (*).'
      return
    }

    if (isEditing.value) {
      await ingresosApi.update(route.params.id, form.value)
    } else {
      await ingresosApi.create(form.value)
    }

    router.push('/ingresos')
  } catch (err) {
    errorMsg.value = err.message || 'Error al guardar el ingreso.'
  } finally {
    saving.value = false
  }
}

const cancelar = () => {
  router.push('/ingresos')
}
</script>
