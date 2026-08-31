<template>
  <AdminLayout>
    <div class="mb-6 sm:mb-8 flex items-center justify-between">
      <div>
        <router-link to="/platillos" class="text-sm font-medium text-brand-500 hover:text-brand-600 mb-2 inline-flex items-center gap-1">
          &larr; Volver a Platillos
        </router-link>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ isEditing ? 'Editar Platillo' : 'Nuevo Platillo' }}
        </h1>
      </div>
    </div>

    <div v-if="loading" class="animate-pulse bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div class="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
      <div class="space-y-4">
        <div class="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div class="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    </div>

    <form v-else @submit.prevent="guardar" class="space-y-6">
      
      <!-- Bloque 1: Info General -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Información Principal</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Platillo *</label>
            <input v-model="form.nombre" type="text" required
                   class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                   placeholder="Ej. Huevos Revueltos con Espinacas" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receta y Preparación</label>
            <textarea v-model="form.receta" rows="4"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y"
                      placeholder="Paso a paso de la preparación..."></textarea>
          </div>
        </div>
      </div>

      <!-- Bloque 2: Información Nutricional (5 Macros) -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Valores Nutricionales</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">🔥 Kcal</label>
            <input v-model.number="form.info_nutricional.kcal" type="number" step="0.1" min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">🥩 Proteína (g)</label>
            <input v-model.number="form.info_nutricional.proteinas" type="number" step="0.1" min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">🌾 Carbs (g)</label>
            <input v-model.number="form.info_nutricional.carbohidratos" type="number" step="0.1" min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">🥑 Grasas (g)</label>
            <input v-model.number="form.info_nutricional.grasas" type="number" step="0.1" min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">🥬 Fibra (g)</label>
            <input v-model.number="form.info_nutricional.fibra" type="number" step="0.1" min="0"
                   class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Bloque 3: Costos / Ingredientes -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Ingredientes y Costos</h2>
          <button type="button" @click="agregarIngrediente" class="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
            <PlusIcon class="w-4 h-4" /> Agregar Fila
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="(item, index) in form.costos" :key="index" class="flex gap-3 items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <input v-model="item.ingrediente" type="text" placeholder="Ingrediente (ej. 2 Huevos)"
                     class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
            <div class="w-32 relative">
              <span class="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input v-model.number="item.precio" type="number" step="0.01" min="0" placeholder="0.00"
                     class="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
            <button type="button" @click="quitarIngrediente(index)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div v-if="form.costos.length === 0" class="text-center py-6 text-gray-400 text-sm">
            No se han agregado ingredientes.
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-3 pt-4">
        <router-link to="/platillos" class="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
          Cancelar
        </router-link>
        <button type="submit" :disabled="saving" class="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2">
          <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isEditing ? 'Guardar Cambios' : 'Crear Platillo' }}
        </button>
      </div>

      <!-- Errores -->
      <div v-if="errorMsg" class="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mt-4 text-sm font-medium">
        {{ errorMsg }}
      </div>
    </form>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import TrashIcon from '@/icons/TrashIcon.vue'
import { platillosApi } from '@/api/index.js'

const router = useRouter()
const route = useRoute()

const isEditing = ref(false)
const platilloId = ref('')
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')

const defaultForm = () => ({
  nombre: '',
  receta: '',
  info_nutricional: {
    kcal: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    fibra: 0
  },
  costos: [] as { ingrediente: string, precio: number }[]
})

const form = ref(defaultForm())

onMounted(async () => {
  if (route.params.id && route.params.id !== 'nuevo') {
    isEditing.value = true
    platilloId.value = route.params.id as string
    await loadPlatillo()
  }
})

async function loadPlatillo() {
  loading.value = true
  try {
    const data = await platillosApi.getById(platilloId.value)
    if (data) {
      form.value.nombre = data.nombre || ''
      form.value.receta = data.receta || ''
      form.value.info_nutricional = data.info_nutricional || defaultForm().info_nutricional
      form.value.costos = data.costos || []
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Error al cargar el platillo'
  } finally {
    loading.value = false
  }
}

function agregarIngrediente() {
  form.value.costos.push({ ingrediente: '', precio: 0 })
}

function quitarIngrediente(index: number) {
  form.value.costos.splice(index, 1)
}

async function guardar() {
  saving.value = true
  errorMsg.value = ''
  
  try {
    if (isEditing.value) {
      await platillosApi.update(platilloId.value, form.value)
    } else {
      await platillosApi.create(form.value)
    }
    router.push('/platillos')
  } catch (error: any) {
    console.error(error)
    errorMsg.value = error.response?.data?.error || 'Error al guardar el platillo'
  } finally {
    saving.value = false
  }
}
</script>
