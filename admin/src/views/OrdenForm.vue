<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        title="Registrar Nueva Orden de Compra"
        :loading="saving"
        submitText="Crear Orden"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="space-y-4 text-xs">
          <!-- Paciente / Cliente con autocompletado -->
          <div class="relative">
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre del Cliente / Paciente *</label>
            <input
              v-model="form.cliente_nombre"
              type="text"
              required
              placeholder="Escribe para buscar paciente registrado o ingresar uno nuevo..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              @focus="showDropdownClientes = true"
              @input="showDropdownClientes = true"
            />
            <div
              v-if="showDropdownClientes && clientesFiltrados.length > 0"
              class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 max-h-48 overflow-y-auto"
            >
              <div
                v-for="cliente in clientesFiltrados"
                :key="cliente.id"
                @mousedown.prevent="seleccionarCliente(cliente)"
                class="cursor-pointer px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center justify-between transition-colors"
              >
                <div>
                  <p class="text-xs font-bold text-gray-800 dark:text-white">{{ cliente.nombre }}</p>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ cliente.telefono }} <span v-if="cliente.correo">• {{ cliente.correo }}</span></p>
                </div>
                <span class="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">Paciente Registrado</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
              <input
                v-model="form.cliente_telefono"
                type="text"
                placeholder="Ej. 5512345678"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
              <input
                v-model="form.cliente_email"
                type="email"
                placeholder="mariana@gmail.com"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Dirección de Entrega *</label>
            <input
              v-model="form.direccion_entrega"
              type="text"
              required
              placeholder="Calle, número, colonia"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Zona de Envío</label>
              <select v-model="form.zona_envio_id" class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Seleccionar zona</option>
                <option v-for="z in zonas" :key="z.id" :value="z.id">{{ z.nombre }} (${{ parseFloat(z.costo).toFixed(2) }})</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
              <select v-model="form.metodo_pago" class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                <option value="Transferencia SPEI">Transferencia SPEI</option>
                <option value="Efectivo en Entrega">Efectivo en Entrega</option>
              </select>
            </div>
          </div>

          <!-- Producto -->
          <div class="border-t border-gray-100 pt-3 dark:border-gray-800">
            <label class="block font-bold text-gray-900 dark:text-white mb-2">Producto Adquirido *</label>
            <div class="grid grid-cols-3 gap-2">
              <select v-model="nuevoItem.producto_id" @change="onProductoChange" class="col-span-2 rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Seleccionar producto</option>
                <option v-for="p in listaProductos" :key="p.id" :value="p.id">{{ p.nombre }} (${{ parseFloat(p.precio).toFixed(2) }})</option>
              </select>
              <input v-model.number="nuevoItem.cantidad" type="number" min="1" placeholder="Cant." class="rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-center" />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormSection from '@/components/common/FormSection.vue'
import { ordenesApi, zonasEnvioApi, productosApi, clientesApi } from '@/api/index.js'

const router = useRouter()
const saving = ref(false)
const errorMsg = ref('')

const zonas = ref<any[]>([])
const listaProductos = ref<any[]>([])
const listaClientes = ref<any[]>([])
const showDropdownClientes = ref(false)

const form = ref({
  cliente_nombre: '',
  cliente_telefono: '',
  cliente_email: '',
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

const clientesFiltrados = computed(() => {
  if (!form.value.cliente_nombre || form.value.cliente_nombre.trim() === '') {
    return listaClientes.value.slice(0, 5)
  }
  const q = form.value.cliente_nombre.toLowerCase()
  return listaClientes.value.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(q)) || 
    (c.telefono && c.telefono.includes(q))
  ).slice(0, 5)
})

function seleccionarCliente(cliente: any) {
  form.value.cliente_nombre = cliente.nombre || ''
  form.value.cliente_telefono = cliente.telefono || ''
  form.value.cliente_email = cliente.correo || ''
  showDropdownClientes.value = false
}

function onProductoChange() {
  const p = listaProductos.value.find(prod => prod.id === nuevoItem.value.producto_id)
  if (p) {
    nuevoItem.value.producto_nombre = p.nombre
    nuevoItem.value.precio_unitario = parseFloat(p.precio) || 0
  }
}

onMounted(async () => {
  try {
    const [dataZonas, dataProductos, dataClientes] = await Promise.all([
      zonasEnvioApi.getAll(),
      productosApi.getAll(),
      clientesApi.getAll()
    ])
    zonas.value = dataZonas
    listaProductos.value = dataProductos
    listaClientes.value = dataClientes
  } catch (e: any) {
    console.error('Error al cargar referencias de orden:', e)
  }
})

async function guardar() {
  if (!nuevoItem.value.producto_nombre) {
    errorMsg.value = 'Por favor selecciona un producto válido para la orden.'
    return
  }

  saving.value = true
  errorMsg.value = ''
  try {
    await ordenesApi.create({
      ...form.value,
      items: [nuevoItem.value]
    })
    router.push('/ordenes')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al registrar orden'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/ordenes')
}
</script>
