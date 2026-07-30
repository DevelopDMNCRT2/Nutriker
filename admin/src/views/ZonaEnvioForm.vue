<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Zona de Envío' : 'Agregar Zona de Envío'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Zona' : 'Crear Zona'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre de la Zona *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Zona Centro (CDMX)"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Tipo / Región *</label>
            <select
              v-model="form.tipo_region"
              required
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="Local">Local</option>
              <option value="Estatal">Estatal</option>
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Costo de Envío ($) *</label>
            <input
              v-model.number="form.costo"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Ej. 50.00"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Tiempo de Entrega Estimado</label>
            <input
              v-model="form.tiempo_entrega"
              type="text"
              placeholder="Ej. 24 a 48 horas"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div class="flex items-center gap-2 pt-6">
            <input
              v-model="form.activa"
              type="checkbox"
              id="zonaActiva"
              class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label for="zonaActiva" class="text-xs font-semibold text-gray-700 dark:text-gray-300">Zona Activa para Checkout</label>
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
import { zonasEnvioApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const zonaId = computed(() => route.params.id as string)
const isEditing = computed(() => !!zonaId.value)

const form = ref({
  nombre: '',
  tipo_region: 'Local',
  costo: 0,
  tiempo_entrega: '24 a 48 horas',
  activa: true
})

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await zonasEnvioApi.getById(zonaId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.tipo_region = data.tipo_region || 'Local'
        form.value.costo = parseFloat(data.costo) || 0
        form.value.tiempo_entrega = data.tiempo_entrega || ''
        form.value.activa = data.activa ?? true
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar la zona de envío'
    }
  }
})

async function guardar() {
  saving.value = true
  errorMsg.value = ''
  try {
    if (isEditing.value) {
      await zonasEnvioApi.update(zonaId.value, form.value)
    } else {
      await zonasEnvioApi.create(form.value)
    }
    router.push('/zonas-envio')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar zona de envío'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/zonas-envio')
}
</script>
