<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Encabezado Principal -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Finanzas y Tesorería
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Control de ingresos por consultas, honorarios, conferencias y ventas en línea de la clínica NutriKer.
          </p>
        </div>

        <button
          @click="$router.push('/ingresos/nuevo')"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Registrar Nuevo Ingreso</span>
        </button>
      </div>

      <!-- Tarjetas de Métricas KPIs -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Ingresos Totales -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</span>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            ${{ totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <span class="text-[11px] text-gray-400">Acumulado histórico</span>
        </div>

        <!-- Ingresos del Mes -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Ingresos del Mes</span>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold text-brand-600 dark:text-brand-400">
            ${{ ingresosMes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <span class="text-[11px] text-gray-400">Mes en curso</span>
        </div>

        <!-- Promedio por Pago -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Ticket Promedio</span>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            ${{ promedioIngreso.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <span class="text-[11px] text-gray-400">Por transacción</span>
        </div>

        <!-- Total de Registros -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Transacciones</span>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {{ ingresos.length }}
          </p>
          <span class="text-[11px] text-gray-400">Registros de pago</span>
        </div>
      </div>

      <!-- Filtro y Búsqueda -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <select
          v-model="filtroMetodo"
          class="w-full sm:w-56 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todos los Métodos de Pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta / En línea">Tarjeta / En línea</option>
          <option value="Transferencia">Transferencia bancaria</option>
          <option value="Cheque">Cheque</option>
        </select>
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por concepto o a nombre de..."
            class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Cargador Skeleton -->
      <LoadingSkeleton v-if="loading" :rows="5" type="table" />

      <!-- Estado Vacío -->
      <EmptyState
        v-else-if="ingresosFiltrados.length === 0"
        title="No se encontraron registros de ingresos"
        description="No hay transacciones que coincidan con los criterios de búsqueda seleccionados."
        actionText="Registrar Nuevo Ingreso"
        @action="$router.push('/ingresos/nuevo')"
      />

      <!-- Tabla Histórica de Ingresos -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-5 py-3.5 font-semibold">ID</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Fecha</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Concepto</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">A Nombre De</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Método de Pago</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Recibe</th>
                <th scope="col" class="px-5 py-3.5 font-semibold text-right">Cantidad</th>
                <th scope="col" class="px-5 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="item in ingresosFiltrados"
                :key="item.id"
                class="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/50"
              >
                <!-- ID -->
                <td class="px-5 py-4 font-mono font-medium text-brand-600 dark:text-brand-400">
                  #{{ item.id }}
                </td>

                <!-- Fecha -->
                <td class="px-5 py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                  {{ item.fecha }}
                </td>

                <!-- Concepto -->
                <td class="px-5 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                  {{ item.concepto }}
                </td>

                <!-- A Nombre De -->
                <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {{ item.a_nombre_de }}
                </td>

                <!-- Método de Pago -->
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    :class="{
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300': item.metodo_pago === 'Efectivo',
                      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300': item.metodo_pago.includes('Tarjeta') || item.metodo_pago.includes('línea'),
                      'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300': item.metodo_pago === 'Transferencia',
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': !['Efectivo', 'Transferencia'].includes(item.metodo_pago)
                    }"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {{ item.metodo_pago }}
                  </span>
                </td>

                <!-- Recibe -->
                <td class="px-5 py-4 text-gray-600 dark:text-gray-400">
                  {{ item.recibe }}
                </td>

                <!-- Cantidad -->
                <td class="px-5 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm whitespace-nowrap">
                  +${{ Number(item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>

                <!-- Acciones -->
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      @click="$router.push(`/ingresos/editar/${item.id}`)"
                      title="Editar registro"
                      class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmarEliminar(item)"
                      title="Eliminar registro"
                      class="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import EmptyState from '../components/common/EmptyState.vue'
import { PlusIcon, TrashIcon } from '../icons'
import { ingresosApi } from '../api'

const ingresos = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filtroMetodo = ref('')

const fetchIngresos = async () => {
  try {
    loading.value = true
    ingresos.value = await ingresosApi.getAll()
  } catch (error) {
    console.error('Error al cargar ingresos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchIngresos()
})

const totalIngresos = computed(() => {
  return ingresos.value.reduce((acc, curr) => acc + Number(curr.cantidad || 0), 0)
})

const ingresosMes = computed(() => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  return ingresos.value
    .filter(item => item.fecha && item.fecha.startsWith(currentMonth))
    .reduce((acc, curr) => acc + Number(curr.cantidad || 0), 0)
})

const promedioIngreso = computed(() => {
  if (ingresos.value.length === 0) return 0
  return totalIngresos.value / ingresos.value.length
})

const ingresosFiltrados = computed(() => {
  return ingresos.value.filter(item => {
    const coincideMetodo = !filtroMetodo.value || item.metodo_pago === filtroMetodo.value
    const query = searchQuery.value.toLowerCase().trim()
    const coincideBusqueda = !query ||
      (item.concepto && item.concepto.toLowerCase().includes(query)) ||
      (item.a_nombre_de && item.a_nombre_de.toLowerCase().includes(query)) ||
      (item.id && item.id.toLowerCase().includes(query))

    return coincideMetodo && coincideBusqueda
  })
})

const confirmarEliminar = async (item) => {
  if (confirm(`¿Estás seguro de eliminar el registro de ingreso #${item.id} por $${item.cantidad}?`)) {
    try {
      await ingresosApi.delete(item.id)
      await fetchIngresos()
    } catch (error) {
      alert('Error al eliminar el ingreso: ' + error.message)
    }
  }
}
</script>
