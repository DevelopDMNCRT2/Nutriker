<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Zonas de Envío y Tarifas
          </h1>
        </div>

        <button
          @click="abrirModalCrear"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Agregar Zona de Envío</span>
        </button>
      </div>

      <!-- Filtro y Búsqueda -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <select
          v-model="filtroRegion"
          class="w-full sm:w-48 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todas las Regiones</option>
          <option value="Local">Local</option>
          <option value="Estatal">Estatal</option>
          <option value="Nacional">Nacional</option>
        </select>
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre de zona..."
            class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Tabla de Zonas de Envío -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th class="px-4 py-3.5">Nombre de la Zona</th>
                <th class="px-4 py-3.5">Región</th>
                <th class="px-4 py-3.5">Costo de Entrega</th>
                <th class="px-4 py-3.5">Tiempo Estimado</th>
                <th class="px-4 py-3.5">Estado</th>
                <th class="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-if="loading" class="text-center">
                <td colspan="6" class="py-8 text-gray-500">Cargando zonas de envío...</td>
              </tr>
              <tr v-else-if="zonasFiltradas.length === 0" class="text-center">
                <td colspan="6" class="py-8 text-gray-500">No se encontraron zonas de envío parametrizadas.</td>
              </tr>
              <tr v-for="zona in zonasFiltradas" :key="zona.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                  {{ zona.nombre }}
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="zona.tipoRegion === 'Local' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : zona.tipoRegion === 'Estatal' ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'"
                  >
                    {{ zona.tipoRegion }}
                  </span>
                </td>
                <td class="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                  ${{ parseFloat(zona.costo).toFixed(2) }} MXN
                </td>
                <td class="px-4 py-3.5 text-gray-600 dark:text-gray-300 flex items-center gap-1.5 pt-4">
                  <svg class="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>{{ zona.tiempoEntrega || '24 a 48 horas' }}</span>
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer"
                    :class="zona.activa ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'"
                    @click="toggleEstado(zona)"
                  >
                    {{ zona.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right space-x-2">
                  <button @click="abrirEditar(zona)" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800 transition-colors">
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="eliminar(zona.id)" class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors">
                    <TrashIcon class="w-4 h-4 text-red-500 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear / Editar Zona de Envío -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarModal"></div>
            <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 z-10">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">
                  {{ isEditing ? 'Editar Zona de Envío' : 'Agregar Nueva Zona de Envío' }}
                </h3>
                <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>

              <div class="space-y-4 text-xs py-4">
                <div v-if="errorForm" class="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40">
                  {{ errorForm }}
                </div>

                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Zona *</label>
                  <input v-model="form.nombre" type="text" placeholder="Ej. Envío Local ZMG (Guadalajara)" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Región *</label>
                    <select v-model="form.tipoRegion" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="Local">Local</option>
                      <option value="Estatal">Estatal</option>
                      <option value="Nacional">Nacional</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Costo de Tarifa (MXN) *</label>
                    <input v-model="form.costo" type="number" step="0.01" min="0" placeholder="Ej. 50.00" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Tiempo de Entrega Estimado</label>
                  <input v-model="form.tiempoEntrega" type="text" placeholder="Ej. 24 a 48 horas hábiles" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>

                <div class="flex items-center gap-2 pt-2">
                  <input v-model="form.activa" type="checkbox" id="checkActiva" class="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  <label for="checkActiva" class="font-medium text-gray-700 dark:text-gray-300">Zona Activa para Clientes</label>
                </div>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button @click="cerrarModal" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancelar
                </button>
                <button @click="guardarZona" :disabled="saving" class="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                  {{ saving ? 'Guardando...' : 'Guardar Zona' }}
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
import { zonasEnvioApi } from '@/api/index.js'
import { PlugInIcon, PlusIcon, TrashIcon } from '@/icons'

const loading = ref(true)
const saving = ref(false)
const zonas = ref<any[]>([])
const searchQuery = ref('')
const filtroRegion = ref('')
const errorForm = ref('')

const modalVisible = ref(false)
const isEditing = ref(false)

const defaultForm = () => ({
  id: null as string | null,
  nombre: '',
  tipoRegion: 'Local',
  costo: '',
  tiempoEntrega: '24 a 48 horas',
  activa: true,
})

const form = ref(defaultForm())

const zonasFiltradas = computed(() => {
  return zonas.value.filter(z => {
    const coincideNombre = z.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    const coincideRegion = !filtroRegion.value || z.tipoRegion === filtroRegion.value
    return coincideNombre && coincideRegion
  })
})

async function cargarZonas() {
  loading.value = true
  try {
    const data = await zonasEnvioApi.getAll()
    zonas.value = data
  } catch (err) {
    console.error('Error al cargar zonas de envío:', err)
  } finally {
    loading.value = false
  }
}

function abrirModalCrear() {
  form.value = defaultForm()
  isEditing.value = false
  errorForm.value = ''
  modalVisible.value = true
}

function abrirEditar(zona: any) {
  form.value = { ...zona }
  isEditing.value = true
  errorForm.value = ''
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}

async function guardarZona() {
  errorForm.value = ''
  if (!form.value.nombre || form.value.costo === '') {
    errorForm.value = 'Por favor ingresa el nombre de la zona y la tarifa de envío.'
    return
  }

  saving.value = true
  try {
    if (isEditing.value && form.value.id) {
      await zonasEnvioApi.update(form.value.id, form.value)
    } else {
      await zonasEnvioApi.create(form.value)
    }
    await cargarZonas()
    cerrarModal()
  } catch (err: any) {
    errorForm.value = err.message || 'Error al guardar la zona de envío.'
  } finally {
    saving.value = false
  }
}

async function toggleEstado(zona: any) {
  try {
    await zonasEnvioApi.update(zona.id, { activa: !zona.activa })
    await cargarZonas()
  } catch (err) {
    console.error('Error al cambiar estado de zona:', err)
  }
}

async function eliminar(id: string) {
  if (confirm('¿Estás seguro que deseas eliminar esta zona de envío?')) {
    try {
      await zonasEnvioApi.delete(id)
      await cargarZonas()
    } catch (err) {
      alert('Error al eliminar zona de envío')
    }
  }
}

onMounted(() => {
  cargarZonas()
})
</script>
