<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="brand-badge">NutriKer Portal</div>
        <h1>Acceso a Pacientes</h1>
        <p>Ingresa tu teléfono a 10 dígitos o correo electrónico para consultar tus dietas y expediente clínico.</p>
      </div>

      <!-- Alerta de Error -->
      <div v-if="errorMsg" class="error-banner">
        <span>{{ errorMsg }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Teléfono de Contacto o Correo Electrónico *</label>
          <input
            v-model="identificador"
            type="text"
            placeholder="Ej. 5544221100 o paciente@ejemplo.com"
            class="form-input"
            required
          />
        </div>

        <button type="submit" :disabled="cargando" class="btn-login">
          {{ cargando ? 'Verificando Expediente...' : 'Ingresar a mi Portal' }}
        </button>
      </form>

      <div class="login-footer">
        <p>¿Eres un paciente nuevo?</p>
        <router-link to="/agendar" class="btn-link">Agenda tu primera cita médica &rarr;</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const identificador = ref('')
const cargando = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!identificador.value.trim()) return
  try {
    cargando.value = true
    errorMsg.value = ''
    const res = await api.post('/public/paciente/login', {
      identificador: identificador.value.trim()
    })

    if (res.paciente) {
      localStorage.setItem('nutriker_paciente', JSON.stringify(res.paciente))
      router.push('/portal')
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo iniciar sesión. Verifica tu información.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background-color: #f9fafb;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  padding: 2.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-badge {
  display: inline-block;
  background: #ecfdf5;
  color: #10b981;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-header p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.4rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 0.95rem;
}

.btn-login {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-login:hover {
  background: #059669;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
}

.btn-link {
  color: #10b981;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  margin-top: 0.25rem;
}
</style>
