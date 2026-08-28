<template>
  <div class="crear-pwd-container">
    <div class="crear-pwd-card">
      
      <div v-if="success" class="success-state text-center animate-fade-in">
        <div class="success-icon">✓</div>
        <h2>¡Contraseña Creada!</h2>
        <p>Tu contraseña ha sido guardada exitosamente. Ya puedes acceder a tu perfil médico.</p>
        <router-link to="/miperfil" class="btn-primary mt-4 inline-block w-full">Ir a Mi Perfil</router-link>
      </div>

      <div v-else class="animate-fade-in">
        <div class="header text-center mb-6">
          <div class="brand-badge">NutriKer</div>
          <h1 class="text-2xl font-bold text-gray-800 mt-2">Crea tu Contraseña</h1>
          <p class="text-sm text-gray-500 mt-2">
            Ingresa una nueva contraseña segura para acceder a tus dietas y gráficas de progreso.
          </p>
        </div>

        <div v-if="errorMsg" class="error-banner mb-4">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              class="form-input"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Escríbela de nuevo"
              class="form-input"
              required
              minlength="6"
            />
          </div>

          <button type="submit" :disabled="cargando" class="btn-primary w-full mt-2">
            {{ cargando ? 'Guardando...' : 'Guardar Contraseña' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const success = ref(false)
const token = ref('')

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token
  } else {
    errorMsg.value = 'El enlace no es válido o está incompleto.'
  }
})

const handleSubmit = async () => {
  if (!token.value) {
    errorMsg.value = 'No hay un token válido.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  try {
    cargando.value = true
    errorMsg.value = ''
    
    await api.post('/auth/reset-password', {
      token: token.value,
      newPassword: password.value
    })

    success.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo guardar la contraseña. Es posible que el enlace haya expirado.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.crear-pwd-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f7f9f8;
  font-family: 'Inter', sans-serif;
}

.crear-pwd-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0,0,0,0.05);
}

.brand-badge {
  display: inline-block;
  background: #eaf3ed;
  color: #4a8c5b;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #4a8c5b;
  box-shadow: 0 0 0 3px rgba(74, 140, 91, 0.1);
}

.btn-primary {
  background: #4a8c5b;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary:hover {
  background: #3a7049;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  text-align: center;
  border: 1px solid #fecaca;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
}

.success-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.success-state p {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
