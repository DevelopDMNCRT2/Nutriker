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

    <!-- Tabla -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <span class="ml-3 text-gray-500 dark:text-gray-400">Cargando usuarios...</span>
      </div>

      <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
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
                    <button @click="handleEliminar(usuario.id)" class="text-red-500 hover:text-red-700" title="Eliminar">
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
    </div>

    <!-- ── Modal Formulario (Agregar / Editar) ── -->
    <Modal v-if="modalFormVisible" :fullScreenBackdrop="true" @close="cerrarFormulario">
      <template #body>
        <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-800 m-4 mx-auto mt-20">
          <h3 class="mb-5 text-xl font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
            {{ isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario' }}
          </h3>

          <!-- Error de formulario -->
          <div v-if="formError" class="mb-4 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700 dark:bg-error-500/15 dark:text-error-400">
            {{ formError }}
          </div>

          <form @submit.prevent="guardarUsuario" class="space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nombre</label>
              <input v-model="form.nombre" type="text" required
                class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                placeholder="Nombre completo" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Usuario</label>
              <input v-model="form.usuario" type="text" required
                class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                placeholder="Nombre de usuario" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Correo</label>
              <input v-model="form.correo" type="email" required
                class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Contraseña
                <span v-if="isEditing" class="text-xs text-gray-400 font-normal ml-1">(dejar en blanco para no cambiar)</span>
              </label>
              <input v-model="form.contrasena" type="password" :required="!isEditing"
                class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                placeholder="••••••••" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Confirmar Contraseña
              </label>
              <input v-model="form.confirmarContrasena" type="password" :required="!isEditing || !!form.contrasena"
                class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                placeholder="••••••••" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Rol</label>
              <select v-model="form.rol" required
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
                <option value="Administrador">Administrador</option>
                <option value="Asistente">Asistente</option>
              </select>
            </div>

            <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button type="button" @click="cerrarFormulario"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button type="submit" :disabled="saving"
                class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 flex items-center gap-2">
                <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </template>
    </Modal>

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

  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { usuariosApi } from '@/api/index.js'

// ── Estado ────────────────────────────────────────────────────────────────────
const usuarios    = ref<any[]>([])
const loading     = ref(false)
const saving      = ref(false)
const errorGlobal = ref('')
const formError   = ref('')
const userRole    = ref('')

// ── Modales ───────────────────────────────────────────────────────────────────
const modalFormVisible     = ref(false)
const modalDetallesVisible = ref(false)
const isEditing            = ref(false)
const usuarioSeleccionado  = ref<any>(null)

// ── Formulario ────────────────────────────────────────────────────────────────
const initForm = () => ({ id: null as string | null, nombre: '', usuario: '', correo: '', contrasena: '', confirmarContrasena: '', rol: 'Asistente' })
const form = reactive({ ...initForm() })

// ── Cargar datos desde la API ─────────────────────────────────────────────────
async function cargarUsuarios() {
  loading.value = true
  errorGlobal.value = ''
  try {
    const data = await usuariosApi.getAll()
    usuarios.value = data
  } catch (e: any) {
    errorGlobal.value = e.message || 'Error al cargar la lista de usuarios'
  } finally {
    loading.value = false
  }
}

onMounted(cargarUsuarios)

// ── Formulario ────────────────────────────────────────────────────────────────
function abrirAgregar() {
  isEditing.value = false
  Object.assign(form, initForm())
  formError.value = ''
  modalFormVisible.value = true
}

function abrirEditar(user: any) {
  isEditing.value = true
  Object.assign(form, { ...user, contrasena: '', confirmarContrasena: '' })
  formError.value = ''
  modalFormVisible.value = true
}

function cerrarFormulario() {
  modalFormVisible.value = false
}

async function guardarUsuario() {
  formError.value = ''

  // Validación de coincidencia de contraseñas
  if (!isEditing.value && !form.contrasena) {
    formError.value = 'La contraseña es obligatoria'
    return
  }

  if (form.contrasena || form.confirmarContrasena) {
    if (form.contrasena !== form.confirmarContrasena) {
      formError.value = 'Las contraseñas no coinciden. Por favor verifícalas e intenta de nuevo.'
      return
    }
  }

  saving.value = true
  try {
    const payload: any = {
      nombre:     form.nombre,
      usuario:    form.usuario,
      correo:     form.correo,
      rol:        form.rol,
    }
    if (form.contrasena) payload.contrasena = form.contrasena

    if (isEditing.value && form.id) {
      await usuariosApi.update(form.id, payload)
    } else {
      await usuariosApi.create({ ...payload, contrasena: form.contrasena })
    }
    await cargarUsuarios()
    cerrarFormulario()
  } catch (e: any) {
    formError.value = e.message || 'Error al guardar el usuario'
  } finally {
    saving.value = false
  }
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
async function handleEliminar(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar a este usuario?')) return
  try {
    await usuariosApi.delete(id)
    usuarios.value = usuarios.value.filter(u => u.id !== id)
  } catch (e: any) {
    errorGlobal.value = e.message || 'Error al eliminar el usuario'
  }
}
</script>
