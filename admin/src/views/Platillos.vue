<template>
  <AdminLayout>
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Platillos</h1>
        <p class="text-sm text-gray-500 mt-1">Administra la base de datos de recetas, costos y macros.</p>
      </div>
      <router-link to="/platillos/nuevo" class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
        <PlusIcon class="w-5 h-5" />
        Nuevo Platillo
      </router-link>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
        <div class="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
        <div class="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
        <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"></div>
        <div class="flex gap-2">
          <div class="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div class="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="platillos.length === 0" class="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div class="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay platillos aún</h3>
      <p class="text-gray-500 mb-6 max-w-md mx-auto">Comienza agregando platillos al catálogo para usarlos en el generador de menús.</p>
      <router-link to="/platillos/nuevo" class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors inline-flex">
        Crear primer platillo
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="platillo in platillos" :key="platillo.id" class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:border-brand-300 dark:hover:border-brand-700 transition-colors group">
        <div class="p-5 flex-1">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-tight">{{ platillo.nombre }}</h3>
          </div>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">
            {{ platillo.receta || 'Sin instrucciones de receta.' }}
          </p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium border border-gray-100 dark:border-gray-700">
              🔥 {{ platillo.info_nutricional?.kcal || 0 }} kcal
            </span>
            <span class="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium border border-green-100 dark:border-green-800">
              🥩 {{ platillo.info_nutricional?.proteinas || 0 }}g
            </span>
            <span class="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium border border-blue-100 dark:border-blue-800">
              🌾 {{ platillo.info_nutricional?.carbohidratos || 0 }}g
            </span>
            <span class="px-2 py-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium border border-yellow-100 dark:border-yellow-800">
              🥑 {{ platillo.info_nutricional?.grasas || 0 }}g
            </span>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800/50 p-4 flex gap-2 border-t border-gray-100 dark:border-gray-800">
          <router-link :to="'/platillos/editar/' + platillo.id" class="flex-1 text-center py-2 bg-white dark:bg-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            Editar
          </router-link>
          <button @click="confirmDelete(platillo)" class="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50">
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <Modal :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="p-6 text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrashIcon class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Eliminar Platillo</h3>
        <p class="text-gray-500 mb-6">¿Estás seguro de que deseas eliminar "{{ platilloToDelete?.nombre }}"? Esta acción no se puede deshacer.</p>
        <div class="flex gap-3 justify-center">
          <button @click="showDeleteModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors">
            Cancelar
          </button>
          <button @click="executeDelete" :disabled="deleting" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2">
            <span v-if="deleting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import TrashIcon from '@/icons/TrashIcon.vue'
import Modal from '@/components/ui/Modal.vue'
import { platillosApi } from '@/api/index.js'

const platillos = ref<any[]>([])
const loading = ref(true)

const showDeleteModal = ref(false)
const platilloToDelete = ref<any>(null)
const deleting = ref(false)

onMounted(async () => {
  await loadPlatillos()
})

async function loadPlatillos() {
  loading.value = true
  try {
    const { data } = await platillosApi.getAll()
    platillos.value = data || []
  } catch (error) {
    console.error('Error al cargar platillos:', error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(platillo: any) {
  platilloToDelete.value = platillo
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!platilloToDelete.value) return
  deleting.value = true
  try {
    await platillosApi.delete(platilloToDelete.value.id)
    await loadPlatillos()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error al eliminar:', error)
  } finally {
    deleting.value = false
  }
}
</script>
