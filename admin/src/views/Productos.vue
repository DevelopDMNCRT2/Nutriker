<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BoxIcon class="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <span>Gestión de Productos y Categorías</span>
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="abrirModalCategoria"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
          <button
            @click="abrirModalCrear"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <select
          v-model="filtroCategoria"
          class="w-full sm:w-48 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todas las Categorías</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
        </select>
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre de producto..."
            class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Tabla de Productos -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th class="px-4 py-3.5">Producto</th>
                <th class="px-4 py-3.5">Categoría</th>
                <th class="px-4 py-3.5">Precio</th>
                <th class="px-4 py-3.5">Descuento</th>
                <th class="px-4 py-3.5">Stock</th>
                <th class="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-if="loading" class="text-center">
                <td colspan="6" class="py-8 text-gray-500">Cargando catálogo de productos...</td>
              </tr>
              <tr v-else-if="productosFiltrados.length === 0" class="text-center">
                <td colspan="6" class="py-8 text-gray-500">No se encontraron productos en el catálogo.</td>
              </tr>
              <tr v-for="prod in productosFiltrados" :key="prod.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                      <img v-if="prod.imagen_principal" :src="prod.imagen_principal" :alt="prod.nombre" class="w-full h-full object-cover" />
                      <BoxIcon v-else class="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-white">{{ prod.nombre }}</p>
                      <p class="text-[11px] text-gray-500 truncate max-w-xs">{{ prod.descripcion }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {{ prod.categoriaNombre || 'Sin categoría' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                  ${{ parseFloat(prod.precio).toFixed(2) }} MXN
                </td>
                <td class="px-4 py-3.5">
                  <span v-if="parseFloat(prod.descuento) > 0" class="text-emerald-600 font-semibold dark:text-emerald-400">
                    -{{ prod.descuento }}%
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="prod.stock > 10 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : prod.stock > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'"
                  >
                    {{ prod.stock > 0 ? `${prod.stock} disponibles` : 'Agotado' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right space-x-2">
                  <button @click="abrirEditar(prod)" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 transition-colors">
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="eliminar(prod.id)" class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors">
                    <TrashIcon class="w-4 h-4 text-red-500 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear / Editar Producto -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalProductoVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarModalProducto"></div>
            <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto z-10">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">
                  {{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}
                </h3>
                <button @click="cerrarModalProducto" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>

              <div class="space-y-4 text-xs py-4">
                <div v-if="errorForm" class="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40">
                  {{ errorForm }}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Producto *</label>
                    <input v-model="form.nombre" type="text" placeholder="Ej. Proteína Whey NutriKer 1kg" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>

                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría *</label>
                    <select v-model="form.categoria_id" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="">Selecciona Categoría</option>
                      <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Disponible *</label>
                    <input v-model="form.stock" type="number" min="0" placeholder="Ej. 25" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>

                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (MXN) *</label>
                    <input v-model="form.precio" type="number" step="0.01" min="0" placeholder="Ej. 799.00" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>

                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Descuento (%)</label>
                    <input v-model="form.descuento" type="number" min="0" max="100" placeholder="Ej. 10" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción Breve *</label>
                    <input v-model="form.descripcion" type="text" placeholder="Resumen corto para la tarjeta del producto" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción Detallada *</label>
                    <textarea v-model="form.descripcion_detallada" placeholder="Especificaciones, ingredientes y modo de empleo" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white h-20"></textarea>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen Principal (Cloudinary)</label>
                    <input type="file" accept="image/*" @change="handleFileChange" class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button @click="cerrarModalProducto" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancelar
                </button>
                <button @click="guardarProducto" :disabled="saving" class="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                  {{ saving ? 'Guardando...' : 'Guardar Producto' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Modal Crear Categoría -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalCategoriaVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarModalCategoria"></div>
            <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 z-10">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Nueva Categoría</h3>
                <button @click="cerrarModalCategoria" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>

              <div class="space-y-3 text-xs py-4">
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Categoría *</label>
                  <input v-model="formCategoria.nombre" type="text" placeholder="Ej. Suplementos, Proteínas..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea v-model="formCategoria.descripcion" placeholder="Descripción breve de la categoría" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white h-16"></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button @click="cerrarModalCategoria" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancelar
                </button>
                <button @click="guardarCategoria" class="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                  Guardar Categoría
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { productosApi, categoriasApi } from '@/api/index.js'
import { BoxIcon, PlusIcon, TrashIcon } from '@/icons'

const loading = ref(true)
const saving = ref(false)
const productos = ref<any[]>([])
const categorias = ref<any[]>([])
const searchQuery = ref('')
const filtroCategoria = ref('')
const errorForm = ref('')

const modalProductoVisible = ref(false)
const modalCategoriaVisible = ref(false)
const isEditing = ref(false)
const archivoImagen = ref<File | null>(null)

const defaultForm = () => ({
  id: null as string | null,
  nombre: '',
  descripcion: '',
  descripcion_detallada: '',
  precio: '',
  descuento: 0,
  stock: 0,
  categoria_id: '',
})

const form = ref(defaultForm())
const formCategoria = ref({ nombre: '', descripcion: '' })

const productosFiltrados = computed(() => {
  return productos.value.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    const coincideCategoria = !filtroCategoria.value || String(p.categoria_id) === String(filtroCategoria.value)
    return coincideNombre && coincideCategoria
  })
})

async function cargarDatos() {
  loading.value = true
  try {
    const [prodsData, catsData] = await Promise.all([
      productosApi.getAll(),
      categoriasApi.getAll(),
    ])
    productos.value = prodsData
    categorias.value = catsData
  } catch (err) {
    console.error('Error al cargar productos/categorías:', err)
  } finally {
    loading.value = false
  }
}

function abrirModalCrear() {
  form.value = defaultForm()
  archivoImagen.value = null
  isEditing.value = false
  errorForm.value = ''
  modalProductoVisible.value = true
}

function abrirEditar(prod: any) {
  form.value = { ...prod }
  archivoImagen.value = null
  isEditing.value = true
  errorForm.value = ''
  modalProductoVisible.value = true
}

function cerrarModalProducto() {
  modalProductoVisible.value = false
}

function abrirModalCategoria() {
  formCategoria.value = { nombre: '', descripcion: '' }
  modalCategoriaVisible.value = true
}

function cerrarModalCategoria() {
  modalCategoriaVisible.value = false
}

function handleFileChange(event: any) {
  const file = event.target.files[0]
  if (file) {
    archivoImagen.value = file
  }
}

async function guardarProducto() {
  errorForm.value = ''
  if (!form.value.nombre || !form.value.descripcion || !form.value.precio) {
    errorForm.value = 'Por favor completa los campos obligatorios.'
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('nombre', form.value.nombre)
    formData.append('descripcion', form.value.descripcion)
    formData.append('descripcion_detallada', form.value.descripcion_detallada || form.value.descripcion)
    formData.append('precio', String(form.value.precio))
    formData.append('descuento', String(form.value.descuento || 0))
    formData.append('stock', String(form.value.stock || 0))
    formData.append('categoria_id', form.value.categoria_id || '')

    if (archivoImagen.value) {
      formData.append('imagen_principal', archivoImagen.value)
    }

    if (isEditing.value && form.value.id) {
      await productosApi.update(form.value.id, formData)
    } else {
      await productosApi.create(formData)
    }

    await cargarDatos()
    cerrarModalProducto()
  } catch (err: any) {
    errorForm.value = err.message || 'Error al guardar el producto.'
  } finally {
    saving.value = false
  }
}

async function guardarCategoria() {
  if (!formCategoria.value.nombre) return
  try {
    await categoriasApi.create(formCategoria.value)
    await cargarDatos()
    cerrarModalCategoria()
  } catch (err) {
    console.error('Error al guardar categoría:', err)
  }
}

async function eliminar(id: string) {
  if (confirm('¿Estás seguro que deseas eliminar este producto de forma permanente?')) {
    try {
      await productosApi.delete(id)
      await cargarDatos()
    } catch (err) {
      alert('Error al eliminar producto')
    }
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
