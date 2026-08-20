<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white/90">Usuarios</h2>
      <button
        @click="abrirAgregar"
        class="rounded-lg bg-brand-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300"
      >
        Agregar Nuevo
      </button>
    </div>

    <!-- Alerta de error global -->
    <div v-if="errorGlobal" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-error-700 dark:bg-error-500/15 dark:text-error-400 flex items-center gap-2">
      <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>{{ errorGlobal }}</span>
    </div>

    <!-- Cargador Skeleton -->
    <LoadingSkeleton v-if="loading" :rows="4" type="table" class="mb-6" />

    <!-- Estado Vacío Ilustrado -->
    <EmptyState
      v-else-if="usuarios.length === 0"
      title="No hay usuarios registrados"
      description="No hay usuarios ni administradores registrados en este momento."
      actionText="Agregar Usuario"
      @action="abrirAgregar"
      class="mb-6"
    />

    <!-- Buscador -->
    <div v-if="usuarios.length > 0 && !loading" class="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full max-w-sm">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input v-model="searchQuery" type="text" class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" placeholder="Buscar usuario...">
      </div>
    </div>

    <!-- Tabla -->
    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-6">
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Nombre</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Usuario</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Correo</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Rol</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Fecha de Alta</p></th>
              <th class="px-5 py-3 text-center sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Acciones</p></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="usuario in usuarios"
              :key="usuario.id"
              class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td class="px-5 py-4 sm:px-6">
                <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ usuario.nombre }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ usuario.usuario }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ usuario.correo }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span :class="['rounded-full px-2 py-0.5 text-theme-xs font-medium',
                  usuario.rol === 'Administrador'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-500'
                    : 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
                ]">
                  {{ usuario.rol }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ usuario.fechaAlta }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <div class="flex justify-center gap-3">
                  <button @click="abrirDetalles(usuario)" class="text-blue-500 hover:text-blue-700" title="Mostrar Detalles">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <template v-if="true">
                    <button @click="abrirEditar(usuario)" class="text-yellow-500 hover:text-yellow-700" title="Editar">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="confirmarEliminar(usuario.id)" class="text-red-500 hover:text-red-700" title="Eliminar">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && usuarios.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                No hay usuarios registrados. ¡Agrega el primero!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total-records="totalRecords" 
        @change="cambiarPagina" 
      />
    </div>



    <!-- ── Modal Detalles ── -->
    <Modal v-if="modalDetallesVisible" :fullScreenBackdrop="true" @close="cerrarDetalles">
      <template #body>
        <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-800 m-4 mx-auto mt-20">
          <h3 class="mb-5 text-xl font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
            Detalles de Usuario
          </h3>

          <div class="space-y-4" v-if="usuarioSeleccionado">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Nombre</p>
                <p class="font-medium text-gray-800 dark:text-white/90">{{ usuarioSeleccionado.nombre }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Usuario</p>
                <p class="font-medium text-gray-800 dark:text-white/90">{{ usuarioSeleccionado.usuario }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Correo</p>
                <p class="font-medium text-gray-800 dark:text-white/90">{{ usuarioSeleccionado.correo }}</p>
              </div>
              <div class="col-span-2" v-if="userRole === 'Administrador'">
                <p class="text-xs text-brand-500 font-semibold mb-0.5">Contraseña (Encriptada o Protegida)</p>
                <p class="font-mono bg-gray-100 dark:bg-gray-700/50 p-2 rounded text-gray-800 dark:text-white/90 break-all">{{ usuarioSeleccionado.contrasena || 'No disponible' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Rol</p>
                <span :class="['inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium',
                  usuarioSeleccionado.rol === 'Administrador'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-500'
                    : 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
                ]">{{ usuarioSeleccionado.rol }}</span>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Fecha de Alta</p>
                <p class="font-medium text-gray-800 dark:text-white/90">{{ usuarioSeleccionado.fechaAlta }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button @click="cerrarDetalles"
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Cerrar
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmar Eliminar -->
    <Modal v-if="modalEliminarVisible" :fullScreenBackdrop="true" @close="cancelarEliminar">
      <template #body>
        <div class="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-800 m-4 mx-auto mt-32 text-center">
          <svg class="mx-auto mb-4 h-12 w-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h3 class="mb-2 text-lg font-bold text-gray-900 dark:text-white">¿Eliminar Usuario?</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta acción no se puede deshacer. El usuario perderá permanentemente el acceso al sistema.</p>
          <div class="flex justify-center gap-3">
            <button @click="cancelarEliminar" class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancelar</button>
            <button @click="handleEliminar" class="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 transition-colors shadow-theme-sm">Sí, eliminar</button>
          </div>
        </div>
      </template>
    </Modal>

  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import Pagination from '@/components/common/Pagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import { usuariosApi } from '@/api/index.js'

const router = useRouter()

// ── Estado ────────────────────────────────────────────────────────────────────
const usuarios    = ref<any[]>([])
const loading     = ref(false)
const errorGlobal = ref('')
const userRole    = ref('')

// Búsqueda y Paginación Server-Side
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)
const totalRecords = ref(0)
let searchTimeout: any = null

// ── Modales ───────────────────────────────────────────────────────────────────
const modalDetallesVisible = ref(false)
const usuarioSeleccionado  = ref<any>(null)

// ── Cargar datos desde la API ─────────────────────────────────────────────────
async function cargarUsuarios() {
  loading.value = true
  errorGlobal.value = ''
  try {
    const res = await usuariosApi.getAll(currentPage.value, itemsPerPage, searchQuery.value)
    usuarios.value = res.data || []
    totalPages.value = res.meta?.totalPages || 1
    totalRecords.value = res.meta?.totalRecords || 0
  } catch (e: any) {
    errorGlobal.value = e.message || 'Error al cargar la lista de usuarios'
  } finally {
    loading.value = false
  }
}

function cambiarPagina(page: number) {
  currentPage.value = page
  cargarUsuarios()
}

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    cargarUsuarios()
  }, 300)
})

onMounted(cargarUsuarios)

// ── Navegación a Formularios ─────────────────────────────────────────────
function abrirAgregar() {
  router.push('/usuarios/nuevo')
}

function abrirEditar(user: any) {
  router.push(`/usuarios/editar/${user.id}`)
}

// ── Detalles ──────────────────────────────────────────────────────────────────
function abrirDetalles(user: any) {
  usuarioSeleccionado.value = { ...user }
  modalDetallesVisible.value = true
}

function cerrarDetalles() {
  modalDetallesVisible.value = false
  setTimeout(() => { usuarioSeleccionado.value = null }, 300)
}

// ── Eliminar (soft delete) ────────────────────────────────────────────────────
const modalEliminarVisible = ref(false)
const usuarioAEliminar = ref<string | null>(null)

function confirmarEliminar(id: string) {
  usuarioAEliminar.value = id
  modalEliminarVisible.value = true
}

function cancelarEliminar() {
  modalEliminarVisible.value = false
  usuarioAEliminar.value = null
}

async function handleEliminar() {
  if (!usuarioAEliminar.value) return
  const id = usuarioAEliminar.value
  try {
    await usuariosApi.delete(id)
    usuarios.value = usuarios.value.filter(u => u.id !== id)
    cancelarEliminar()
  } catch (e: any) {
    errorGlobal.value = e.message || 'Error al eliminar el usuario'
  }
}
</script>
