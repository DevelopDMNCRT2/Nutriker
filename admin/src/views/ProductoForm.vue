<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Producto del Catálogo' : 'Registrar Nuevo Producto'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Producto' : 'Crear Producto'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre del Producto *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Proteína Aislada NutriKer 1kg"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Categoría *</label>
            <select
              v-model="form.categoria_id"
              required
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Seleccionar categoría</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Precio Unitario ($) *</label>
            <input
              v-model.number="form.precio"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Ej. 850.00"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Descuento (%)</label>
            <input
              v-model.number="form.descuento"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej. 10.00"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Stock Inicial *</label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              required
              placeholder="Ej. 25"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Descripción Corta</label>
            <textarea
              v-model="form.descripcion"
              rows="2"
              placeholder="Resumen del producto..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
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
import { productosApi, categoriasApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const categorias = ref<any[]>([])
const productoId = computed(() => route.params.id as string)
const isEditing = computed(() => !!productoId.value)

const form = ref({
  nombre: '',
  categoria_id: '',
  precio: 0,
  descuento: 0,
  stock: 0,
  descripcion: ''
})

onMounted(async () => {
  try {
    categorias.value = await categoriasApi.getAll()
  } catch (e) {}

  if (isEditing.value) {
    try {
      const data = await productosApi.getById(productoId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.categoria_id = data.categoria_id || ''
        form.value.precio = parseFloat(data.precio) || 0
        form.value.descuento = parseFloat(data.descuento) || 0
        form.value.stock = data.stock || 0
        form.value.descripcion = data.descripcion || ''
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos del producto'
    }
  }
})

async function guardar() {
  errorMsg.value = ''
  saving.value = true
  try {
    if (isEditing.value) {
      await productosApi.update(productoId.value, form.value)
    } else {
      await productosApi.create(form.value)
    }
    router.push('/productos')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar producto'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/productos')
}
</script>
