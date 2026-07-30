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

          <!-- Buscador y Etiquetas Seleccionables de Categorías desde la Base de Datos -->
          <div class="sm:col-span-2 relative">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Categorías *</label>

            <!-- Contenedor de Etiquetas e Input de Búsqueda -->
            <div class="flex flex-wrap items-center gap-1.5 w-full rounded-xl border border-gray-300 bg-transparent p-2 dark:border-gray-700 dark:bg-gray-800 min-h-[42px] focus-within:border-emerald-500 transition-colors">
              <span
                v-for="catId in form.categorias_ids"
                :key="catId"
                class="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                {{ getNombreCategoria(catId) }}
                <button
                  type="button"
                  @click="removerCategoria(catId)"
                  class="hover:text-emerald-950 dark:hover:text-white font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>

              <input
                v-model="busquedaCategoria"
                type="text"
                placeholder="Buscar y agregar categorías..."
                class="flex-1 bg-transparent border-0 outline-none text-xs text-gray-800 dark:text-white min-w-[140px] px-1 py-0.5"
                @focus="mostrarDropdownCat = true"
                @input="mostrarDropdownCat = true"
              />
            </div>

            <!-- Dropdown de Sugerencias Filtradas -->
            <div
              v-if="mostrarDropdownCat && sugerenciasCategorias.length > 0"
              class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
            >
              <div
                v-for="c in sugerenciasCategorias"
                :key="c.id"
                @mousedown.prevent="agregarCategoria(c.id)"
                class="cursor-pointer px-3.5 py-2 hover:bg-emerald-50 dark:hover:bg-gray-700/60 text-xs font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
              >
                <span>{{ c.nombre }}</span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+ Agregar</span>
              </div>
            </div>
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
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Descripción Corta *</label>
            <textarea
              v-model="form.descripcion"
              rows="2"
              required
              placeholder="Resumen corto del producto para las tarjetas..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Descripción Detallada *</label>
            <textarea
              v-model="form.descripcion_detallada"
              rows="3"
              required
              placeholder="Especificaciones, beneficios e instrucciones de uso..."
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
const busquedaCategoria = ref('')
const mostrarDropdownCat = ref(false)

const productoId = computed(() => route.params.id as string)
const isEditing = computed(() => !!productoId.value)

const form = ref({
  nombre: '',
  categorias_ids: [] as string[],
  precio: 0,
  descuento: 0,
  stock: 0,
  descripcion: '',
  descripcion_detallada: ''
})

function getNombreCategoria(id: string | number) {
  const c = categorias.value.find(cat => String(cat.id) === String(id))
  return c ? c.nombre : String(id)
}

const sugerenciasCategorias = computed(() => {
  const query = busquedaCategoria.value.toLowerCase().trim()
  return categorias.value.filter(cat => {
    const yaSeleccionada = form.value.categorias_ids.includes(String(cat.id))
    const coincide = !query || cat.nombre.toLowerCase().includes(query)
    return !yaSeleccionada && coincide
  })
})

function agregarCategoria(id: string | number) {
  const strId = String(id)
  if (!form.value.categorias_ids.includes(strId)) {
    form.value.categorias_ids.push(strId)
  }
  busquedaCategoria.value = ''
  mostrarDropdownCat.value = false
}

function removerCategoria(id: string | number) {
  const strId = String(id)
  form.value.categorias_ids = form.value.categorias_ids.filter(c => c !== strId)
}

onMounted(async () => {
  try {
    categorias.value = await categoriasApi.getAll()
  } catch (e) {}

  if (isEditing.value) {
    try {
      const data = await productosApi.getById(productoId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        if (data.categoria_id) {
          form.value.categorias_ids = data.categoria_id.split(',')
        }
        form.value.precio = parseFloat(data.precio) || 0
        form.value.descuento = parseFloat(data.descuento) || 0
        form.value.stock = data.stock || 0
        form.value.descripcion = data.descripcion || ''
        form.value.descripcion_detallada = data.descripcion_detallada || ''
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos del producto'
    }
  }
})

async function guardar() {
  if (form.value.categorias_ids.length === 0) {
    errorMsg.value = 'Debes seleccionar al menos una categoría'
    return
  }

  errorMsg.value = ''
  saving.value = true
  try {
    const payload = {
      ...form.value,
      categoria_id: form.value.categorias_ids.join(',')
    }
    if (isEditing.value) {
      await productosApi.update(productoId.value, payload)
    } else {
      await productosApi.create(payload)
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
