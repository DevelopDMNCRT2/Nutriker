<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Registro de Usuario' : 'Registrar Nuevo Usuario'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Usuario' : 'Crear Usuario'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre Completo *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Karla Ramírez"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre de Usuario *</label>
            <input
              v-model="form.usuario"
              type="text"
              required
              placeholder="ej. karla_admin"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico *</label>
            <input
              v-model="form.correo"
              type="email"
              required
              placeholder="admin@nutriker.com"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Rol de Acceso *</label>
            <select
              v-model="form.rol"
              required
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="Administrador">Administrador</option>
              <option value="Asistente">Asistente</option>
              <option value="RRHH">Recursos Humanos (RRHH)</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              v-model="form.contrasena"
              type="password"
              :required="!isEditing"
              placeholder="••••••••"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
            <input
              v-model="form.confirmarContrasena"
              type="password"
              :required="!isEditing || !!form.contrasena"
              placeholder="••••••••"
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
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
import { usuariosApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const usuarioId = computed(() => route.params.id as string)
const isEditing = computed(() => !!usuarioId.value)

const form = ref({
  nombre: '',
  usuario: '',
  correo: '',
  rol: 'Asistente',
  contrasena: '',
  confirmarContrasena: ''
})

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await usuariosApi.getById(usuarioId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.usuario = data.usuario || ''
        form.value.correo = data.correo || ''
        form.value.rol = data.rol || 'Asistente'
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos del usuario'
    }
  }
})

async function guardar() {
  errorMsg.value = ''
  if (form.value.contrasena && form.value.contrasena !== form.value.confirmarContrasena) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      const payload: any = {
        nombre: form.value.nombre,
        usuario: form.value.usuario,
        correo: form.value.correo,
        rol: form.value.rol
      }
      if (form.value.contrasena) {
        payload.contrasena = form.value.contrasena
      }
      await usuariosApi.update(usuarioId.value, payload)
    } else {
      await usuariosApi.create({
        nombre: form.value.nombre,
        usuario: form.value.usuario,
        correo: form.value.correo,
        rol: form.value.rol,
        contrasena: form.value.contrasena
      })
    }
    router.push('/usuarios')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar usuario'
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/usuarios')
}
</script>
