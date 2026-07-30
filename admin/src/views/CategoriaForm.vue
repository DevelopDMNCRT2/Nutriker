<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Categoría' : 'Registrar Nueva Categoría'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Categoría' : 'Crear Categoría'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre de la Categoría *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Suplementos, Proteínas, Vitaminas..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              placeholder="Descripción breve de la categoría"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
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
import { categoriasApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const categoriaId = computed(() => route.params.id as string)
const isEditing = computed(() => !!categoriaId.value)

const form = ref({
  nombre: '',
  descripcion: ''
})

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await categoriasApi.getById(categoriaId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.descripcion = data.descripcion || ''
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar la categoría'
    }
  }
})

async function guardar() {
  saving.value = true
  errorMsg.value = ''
  try {
    if (isEditing.value) {
      await categoriasApi.update(categoriaId.value, form.value)
    } else {
      await categoriasApi.create(form.value)
    }
    router.push('/productos')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar la categoría'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/productos')
}
</script>
