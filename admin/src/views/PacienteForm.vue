<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Expediente de Paciente' : 'Registrar Nuevo Paciente'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Paciente' : 'Crear Paciente'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre Completo del Paciente *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Ana Sofía Montenegro"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Sexo *</label>
            <select
              v-model="form.sexo"
              required
              class="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="" disabled>Seleccionar sexo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Teléfono *</label>
            <input
              v-model="form.telefono"
              type="text"
              required
              placeholder="Ej. 5512345678"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input
              v-model="form.correo"
              type="email"
              placeholder="paciente@ejemplo.com"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Edad</label>
            <input
              v-model.number="form.edad"
              type="number"
              min="1"
              placeholder="Ej. 28"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Ocupación / Notas</label>
            <input
              v-model="form.ocupacion"
              type="text"
              placeholder="Ej. Ingeniera de Software"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </FormSection>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormSection from '@/components/common/FormSection.vue'
import { pacientesApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const pacienteId = computed(() => route.params.id as string)
const isEditing = computed(() => !!pacienteId.value)

const form = ref({
  nombre: '',
  sexo: '',
  telefono: '',
  correo: '',
  edad: null as number | null,
  ocupacion: '',
  cita_id: null as string | null
})

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await pacientesApi.getById(pacienteId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.sexo = data.sexo || ''
        form.value.telefono = data.telefono || ''
        form.value.correo = data.correo || ''
        form.value.edad = data.edad || null
        form.value.ocupacion = data.ocupacion || ''
        form.value.cita_id = data.cita_id || null
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos del paciente'
    }
  } else {
    // Si venimos del calendario de citas, prellenar los datos
    if (route.query.nombre) form.value.nombre = String(route.query.nombre)
    if (route.query.telefono) form.value.telefono = String(route.query.telefono)
    if (route.query.cita_id) form.value.cita_id = String(route.query.cita_id)
  }
})

async function guardar() {
  errorMsg.value = ''
  
  if (!form.value.nombre || !form.value.telefono || !form.value.sexo) {
    errorMsg.value = 'Por favor completa todos los campos requeridos (*), incluyendo el sexo.'
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await pacientesApi.update(pacienteId.value, form.value)
    } else {
      await pacientesApi.create(form.value)
    }
    router.push('/pacientes')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar paciente'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/pacientes')
}
</script>
