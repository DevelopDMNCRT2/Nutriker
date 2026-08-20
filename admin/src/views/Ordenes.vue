<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Órdenes de Compra y Envíos
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="abrirModalCrear"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Registrar Nueva Orden</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Ventas Totales</span>
          <div class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">${{ totalVentas.toFixed(2) }}</div>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Pagadas</span>
          <div class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ ordenesPagadas }}</div>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">En Preparación</span>
          <div class="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{{ enviosPendientes }}</div>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Entregadas</span>
          <div class="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{{ enviosEntregados }}</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-3 justify-between items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            v-model="filtroPago"
            class="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los Estados de Pago</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Completado">Completado</option>
          </select>
          <select
            v-model="filtroEnvio"
            class="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los Estados de Envío</option>
            <option value="En preparación">En preparación</option>
            <option value="En camino">En camino</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por paciente o ID de orden..."
            class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Cargador Spinner -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 text-gray-500">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p class="mt-3 text-xs font-medium">Cargando órdenes de compra...</p>
      </div>

      <!-- Estado Vacío -->
      <div v-else-if="ordenesFiltradas.length === 0" class="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-300 bg-white text-center dark:border-gray-800 dark:bg-gray-900">
        <div class="rounded-full bg-emerald-50 p-3 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">No hay órdenes de compra registradas</h3>
        <button @click="abrirModalCrear" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-emerald-700 hover:to-teal-700">
          <PlusIcon class="w-4 h-4" />
          <span>Registrar Nueva Orden</span>
        </button>
      </div>

      <!-- Tabla de Órdenes -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th class="px-4 py-3.5">ID Orden</th>
                <th class="px-4 py-3.5">Paciente / Paciente</th>
                <th class="px-4 py-3.5">Zona de Envío</th>
                <th class="px-4 py-3.5">Total</th>
                <th class="px-4 py-3.5">Estado Pago</th>
                <th class="px-4 py-3.5">Estado Envío</th>
                <th class="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="orden in ordenesFiltradas" :key="orden.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  #{{ orden.id }}
                </td>
                <td class="px-4 py-3.5">
                  <span class="block font-semibold text-gray-900 dark:text-white">{{ orden.paciente_nombre }}</span>
                  <span class="text-[11px] text-gray-500">{{ orden.paciente_telefono || orden.paciente_email || 'Sin contacto' }}</span>
                </td>
                <td class="px-4 py-3.5">
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{ orden.zona_nombre || 'Sin zona asignada' }}</span>
                  <span v-if="orden.zona_costo" class="block text-[10px] text-gray-400">+${{ parseFloat(orden.zona_costo).toFixed(2) }} envío</span>
                </td>
                <td class="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                  ${{ parseFloat(orden.total).toFixed(2) }}
                </td>
                <td class="px-4 py-3.5">
                  <select
                    :value="orden.estado_orden"
                    @change="cambiarEstadoOrden(orden.id, ($event.target as HTMLSelectElement).value)"
                    class="rounded-lg border px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800': orden.estado_orden === 'Pagado' || orden.estado_orden === 'Completado',
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800': orden.estado_orden === 'Pendiente',
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800': orden.estado_orden === 'Rechazado' || orden.estado_orden === 'Cancelado',
                    }"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>
                <td class="px-4 py-3.5">
                  <select
                    :value="orden.estado_envio"
                    @change="cambiarEstadoEnvio(orden.id, ($event.target as HTMLSelectElement).value)"
                    class="rounded-lg border px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer"
                    :class="{
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800': orden.estado_envio === 'Entregado',
                      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800': orden.estado_envio === 'En camino',
                      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700': orden.estado_envio === 'En preparación',
                    }"
                  >
                    <option value="En preparación">En preparación</option>
                    <option value="En camino">En camino</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Devuelto">Devuelto</option>
                  </select>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="abrirDetalles(orden)"
                      class="p-1.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 transition-colors"
                      title="Ver Detalles"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button
                      @click="eliminar(orden.id)"
                      class="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 transition-colors"
                      title="Eliminar Orden"
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

      <!-- Modal Detalles Orden -->
      <Modal v-if="modalDetallesVisible" :fullScreenBackdrop="true" @close="cerrarDetalles">
        <template #body>
          <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 m-4 mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800 mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Orden de Compra #{{ ordenSeleccionada?.id }}</span>
                </h3>
                <p class="text-xs text-gray-500">Fecha: {{ new Date(ordenSeleccionada?.created_at).toLocaleString('es-MX') }}</p>
              </div>
              <button @click="cerrarDetalles" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                ✕
              </button>
            </div>

            <div v-if="ordenSeleccionada" class="space-y-5 text-xs">
              <!-- Paciente & Dirección -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div>
                  <p class="font-bold text-gray-500 uppercase tracking-wider mb-1">Paciente / Paciente</p>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ ordenSeleccionada.paciente_nombre }}</p>
                  <p class="text-gray-500">{{ ordenSeleccionada.paciente_telefono }}</p>
                  <p class="text-gray-500">{{ ordenSeleccionada.paciente_email }}</p>
                </div>
                <div>
                  <p class="font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección de Entrega</p>
                  <p class="font-medium text-gray-800 dark:text-gray-200">{{ ordenSeleccionada.direccion_entrega }}</p>
                  <p class="text-gray-500">{{ ordenSeleccionada.ciudad }}</p>
                  <p class="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Zona: {{ ordenSeleccionada.zona_nombre || 'Local' }}</p>
                </div>
              </div>

              <!-- Lista de Productos Comprados -->
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white mb-2 text-sm">Productos Comprados</h4>
                <div class="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <table class="w-full text-left">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold">
                      <tr>
                        <th class="p-3">Producto</th>
                        <th class="p-3 text-center">Cant.</th>
                        <th class="p-3 text-right">Precio Unit.</th>
                        <th class="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr v-for="item in ordenSeleccionada.items" :key="item.id">
                        <td class="p-3 font-medium text-gray-900 dark:text-white">{{ item.producto_nombre }}</td>
                        <td class="p-3 text-center font-bold">{{ item.cantidad }}</td>
                        <td class="p-3 text-right">${{ parseFloat(item.precio_unitario).toFixed(2) }}</td>
                        <td class="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${{ parseFloat(item.subtotal).toFixed(2) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Resumen Total -->
              <div class="flex justify-between items-center border-t border-gray-100 pt-4 dark:border-gray-800">
                <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Total General:</span>
                <span class="text-xl font-bold text-emerald-600 dark:text-emerald-400">${{ parseFloat(ordenSeleccionada.total).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </template>
      </Modal>

      <!-- Modal Registrar Nueva Orden -->
      <Modal v-if="modalCrearVisible" :fullScreenBackdrop="true" @close="cerrarModalCrear">
        <template #body>
          <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 m-4 mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">Registrar Nueva Orden de Compra</h3>
              <button @click="cerrarModalCrear" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>

            <form @submit.prevent="guardarOrden" class="space-y-4 text-xs">
              <div class="relative">
                <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Paciente / Paciente *</label>
                <input
                  v-model="formCrear.paciente_nombre"
                  type="text"
                  required
                  placeholder="Escribe para buscar paciente registrado o ingresar uno nuevo..."
                  class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  @focus="showDropdownPacientes = true"
                  @input="showDropdownPacientes = true"
                />
                <!-- Dropdown de búsqueda de pacientes -->
                <div
                  v-if="showDropdownPacientes && pacientesFiltrados.length > 0"
                  class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="paciente in pacientesFiltrados"
                    :key="paciente.id"
                    @mousedown.prevent="seleccionarPaciente(paciente)"
                    class="cursor-pointer px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p class="text-xs font-bold text-gray-800 dark:text-white">{{ paciente.nombre }}</p>
                      <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ paciente.telefono }} <span v-if="paciente.correo">• {{ paciente.correo }}</span></p>
                    </div>
                    <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">Paciente Registrado</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input v-model="formCrear.paciente_telefono" type="text" placeholder="Ej. 5512345678" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input v-model="formCrear.paciente_email" type="email" placeholder="mariana@gmail.com" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>

              <div>
                <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección de Entrega *</label>
                <input v-model="formCrear.direccion_entrega" type="text" required placeholder="Calle, número, colonia" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Zona de Envío</label>
                  <select v-model="formCrear.zona_envio_id" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="">Seleccionar zona</option>
                    <option v-for="z in zonas" :key="z.id" :value="z.id">{{ z.nombre }} (${{ parseFloat(z.costo).toFixed(2) }})</option>
                  </select>
                </div>
                <div>
                  <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                  <select v-model="formCrear.metodo_pago" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                    <option value="Transferencia SPEI">Transferencia SPEI</option>
                    <option value="Efectivo en Entrega">Efectivo en Entrega</option>
                  </select>
                </div>
              </div>

              <!-- Producto de la orden -->
              <div class="border-t border-gray-100 pt-3 dark:border-gray-800">
                <label class="block font-bold text-gray-900 dark:text-white mb-2">Producto Adquirido *</label>
                <div class="grid grid-cols-3 gap-2">
                  <select v-model="nuevoItem.producto_id" @change="onProductoChange" class="col-span-2 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="">Seleccionar producto</option>
                    <option v-for="p in listaProductos" :key="p.id" :value="p.id">{{ p.nombre }} (${{ parseFloat(p.precio).toFixed(2) }})</option>
                  </select>
                  <input v-model.number="nuevoItem.cantidad" type="number" min="1" placeholder="Cant." class="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-center" />
                </div>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button type="button" @click="cerrarModalCrear" class="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">Cancelar</button>
                <button type="submit" :disabled="guardando" class="px-5 py-2 font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow transition-colors">
                  {{ guardando ? 'Guardando...' : 'Crear Orden' }}
                </button>
              </div>
            </form>
          </div>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { ordenesApi, zonasEnvioApi, productosApi, pacientesApi } from '@/api/index.js'
import { PlusIcon, TrashIcon } from '@/icons'

const router = useRouter()

const loading = ref(true)
const guardando = ref(false)
const ordenes = ref<any[]>([])
const zonas = ref<any[]>([])
const listaProductos = ref<any[]>([])
const listaPacientes = ref<any[]>([])
const showDropdownPacientes = ref(false)
const searchQuery = ref('')
const filtroPago = ref('')
const filtroEnvio = ref('')

const modalDetallesVisible = ref(false)
const modalCrearVisible = ref(false)
const ordenSeleccionada = ref<any>(null)

const formCrear = ref({
  paciente_nombre: '',
  paciente_telefono: '',
  paciente_email: '',
  direccion_entrega: '',
  ciudad: 'Ciudad de México',
  zona_envio_id: '',
  metodo_pago: 'Tarjeta de Crédito/Débito'
})

const nuevoItem = ref({
  producto_id: '',
  producto_nombre: '',
  cantidad: 1,
  precio_unitario: 0
})

const pacientesFiltrados = computed(() => {
  if (!formCrear.value.paciente_nombre || formCrear.value.paciente_nombre.trim() === '') {
    return listaPacientes.value.slice(0, 5)
  }
  const q = formCrear.value.paciente_nombre.toLowerCase()
  return listaPacientes.value.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(q)) || 
    (c.telefono && c.telefono.includes(q))
  ).slice(0, 5)
})

function seleccionarPaciente(paciente: any) {
  formCrear.value.paciente_nombre = paciente.nombre || ''
  formCrear.value.paciente_telefono = paciente.telefono || ''
  formCrear.value.paciente_email = paciente.correo || ''
  showDropdownPacientes.value = false
}

const ordenesFiltradas = computed(() => {
  return ordenes.value.filter(o => {
    const query = searchQuery.value.toLowerCase()
    const coincideBusqueda = o.paciente_nombre.toLowerCase().includes(query) || String(o.id).toLowerCase().includes(query)
    const coincidePago = !filtroPago.value || o.estado_orden === filtroPago.value
    const coincideEnvio = !filtroEnvio.value || o.estado_envio === filtroEnvio.value
    return coincideBusqueda && coincidePago && coincideEnvio
  })
})

const totalVentas = computed(() => {
  return ordenes.value.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
})

const ordenesPagadas = computed(() => {
  return ordenes.value.filter(o => o.estado_orden === 'Pagado' || o.estado_orden === 'Completado').length
})

const enviosPendientes = computed(() => {
  return ordenes.value.filter(o => o.estado_envio === 'En preparación').length
})

const enviosEntregados = computed(() => {
  return ordenes.value.filter(o => o.estado_envio === 'Entregado').length
})

async function cargarDatos() {
  loading.value = true
  try {
    const [dataOrdenes, dataZonas, dataProductos, dataPacientes] = await Promise.all([
      ordenesApi.getAll(),
      zonasEnvioApi.getAll(),
      productosApi.getAll(),
      pacientesApi.getAll()
    ])
    ordenes.value = dataOrdenes
    zonas.value = dataZonas
    listaProductos.value = dataProductos
    listaPacientes.value = dataPacientes
  } catch (e: any) {
    console.error('Error al cargar órdenes:', e.message)
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)

const abrirDetalles = (orden: any) => {
  ordenSeleccionada.value = { ...orden }
  modalDetallesVisible.value = true
}

const cerrarDetalles = () => {
  modalDetallesVisible.value = false
}

const abrirModalCrear = () => {
  router.push('/ordenes/nuevo')
}

const cerrarModalCrear = () => {
  modalCrearVisible.value = false
  showDropdownPacientes.value = false
}

const onProductoChange = () => {
  const p = listaProductos.value.find(prod => prod.id === nuevoItem.value.producto_id)
  if (p) {
    nuevoItem.value.producto_nombre = p.nombre
    nuevoItem.value.precio_unitario = parseFloat(p.precio)
  }
}

const cambiarEstadoOrden = async (id: string, nuevoEstado: string) => {
  try {
    await ordenesApi.updateEstadoOrden(id, { estado_orden: nuevoEstado })
    await cargarDatos()
  } catch (e: any) {
    alert(e.message || 'Error al cambiar estado de orden')
  }
}

const cambiarEstadoEnvio = async (id: string, nuevoEstado: string) => {
  try {
    await ordenesApi.updateEstadoEnvio(id, { estado_envio: nuevoEstado })
    await cargarDatos()
  } catch (e: any) {
    alert(e.message || 'Error al cambiar estado de envío')
  }
}

const guardarOrden = async () => {
  if (!nuevoItem.value.producto_nombre) {
    alert('Por favor selecciona un producto para la orden.')
    return
  }
  guardando.value = true
  try {
    const payload = {
      ...formCrear.value,
      items: [
        {
          producto_id: nuevoItem.value.producto_id || null,
          producto_nombre: nuevoItem.value.producto_nombre,
          cantidad: nuevoItem.value.cantidad || 1,
          precio_unitario: nuevoItem.value.precio_unitario
        }
      ]
    }
    await ordenesApi.create(payload)
    await cargarDatos()
    cerrarModalCrear()
  } catch (e: any) {
    alert(e.message || 'Error al crear la orden')
  } finally {
    guardando.value = false
  }
}

const eliminar = async (id: string) => {
  if (confirm('¿Estás seguro que deseas eliminar esta orden de compra?')) {
    try {
      await ordenesApi.delete(id)
      await cargarDatos()
    } catch (e: any) {
      alert(e.message || 'Error al eliminar orden')
    }
  }
}
</script>
