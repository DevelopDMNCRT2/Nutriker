<template>
  <div class="login-container">
    <div class="login-card animate-fade-in">
      
      <!-- ── VISTA PRINCIPAL (LOGIN) ── -->
      <div v-if="!mostrandoRecuperar">
        <div class="login-header">
          <div class="brand-badge">Mi Portal NutriKer</div>
          <h1>Bienvenido a tu salud</h1>
          <p>Ingresa tu teléfono o correo registrado para ver tu menú y gráficas de evolución.</p>
        </div>

        <div v-if="errorMsg" class="error-banner">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Teléfono o Correo Electrónico</label>
            <input
              v-model="identificador"
              type="text"
              placeholder="Ej. 5544221100 o correo@ejemplo.com"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="Tu contraseña secreta"
              class="form-input"
              required
            />
          </div>

          <button type="submit" :disabled="cargando" class="btn-primary mt-2">
            {{ cargando ? 'Accediendo...' : 'Entrar a mi portal' }}
          </button>
        </form>

        <div class="login-footer">
          <button @click="mostrandoRecuperar = true; stepRecuperar = 1" class="btn-text">
            ¿Olvidaste o no tienes contraseña?
          </button>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">¿Eres un paciente nuevo?</p>
            <router-link to="/agendar" class="btn-link text-sm">Agenda tu primera cita médica &rarr;</router-link>
          </div>
        </div>
      </div>

      <!-- ── VISTA RECUPERAR CONTRASEÑA ── -->
      <div v-else>
        <button @click="volverAlLogin" class="back-btn mb-4">
          &larr; Volver a Iniciar Sesión
        </button>

        <div class="login-header mb-6">
          <h2 class="text-xl font-bold text-gray-800">Recupera tu acceso</h2>
          <p class="text-sm text-gray-500 mt-1">Sigue los pasos para crear o recuperar tu contraseña de forma segura.</p>
        </div>

        <div v-if="errorMsgRecuperar" class="error-banner mb-4">
          {{ errorMsgRecuperar }}
        </div>

        <!-- Paso 1: Pedir Teléfono -->
        <form v-if="stepRecuperar === 1" @submit.prevent="buscarTelefono" class="flex flex-col gap-4">
          <div class="form-group">
            <label>Ingresa tu Teléfono (10 dígitos)</label>
            <input
              v-model="recuperarTelefono"
              type="tel"
              placeholder="Ej. 5512345678"
              class="form-input"
              required
              minlength="10"
            />
          </div>
          <button type="submit" :disabled="cargando" class="btn-primary">
            {{ cargando ? 'Buscando...' : 'Siguiente' }}
          </button>
        </form>

        <!-- Paso 2: Confirmar Correo -->
        <form v-if="stepRecuperar === 2" @submit.prevent="enviarLink" class="flex flex-col gap-4">
          <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center mb-2">
            <p class="text-xs text-blue-600 font-bold uppercase mb-1">Tu correo registrado es similar a:</p>
            <p class="text-lg font-mono font-bold text-gray-800">{{ correoCensurado }}</p>
          </div>
          <div class="form-group">
            <label>Por seguridad, escribe tu correo completo:</label>
            <input
              v-model="correoConfirmacion"
              type="email"
              placeholder="Ej. micorreo@gmail.com"
              class="form-input"
              required
            />
          </div>
          <button type="submit" :disabled="cargando" class="btn-primary">
            {{ cargando ? 'Enviando enlace...' : 'Enviar enlace de recuperación' }}
          </button>
        </form>

        <!-- Paso 3: Éxito -->
        <div v-if="stepRecuperar === 3" class="text-center py-4">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
          <h3 class="text-lg font-bold text-gray-800">¡Enlace Enviado!</h3>
          <p class="text-sm text-gray-500 mt-2">Revisa tu bandeja de entrada o spam. Hemos enviado un link seguro para crear tu nueva contraseña.</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

// Estados Login
const identificador = ref('')
const password = ref('')
const cargando = ref(false)
const errorMsg = ref('')

// Estados Recuperar
const mostrandoRecuperar = ref(false)
const stepRecuperar = ref(1)
const errorMsgRecuperar = ref('')
const recuperarTelefono = ref('')
const correoCensurado = ref('')
const correoConfirmacion = ref('')

const handleLogin = async () => {
  if (!identificador.value.trim() || !password.value.trim()) return
  try {
    cargando.value = true
    errorMsg.value = ''
    const res = await api.post('/auth/login-paciente', {
      email: identificador.value.trim(),
      password: password.value.trim()
    })

    if (res.paciente && res.token) {
      localStorage.setItem('paciente_token', res.token)
      localStorage.setItem('paciente_data', JSON.stringify(res.paciente))
      router.push('/portal')
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Credenciales incorrectas. Intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

const buscarTelefono = async () => {
  try {
    cargando.value = true
    errorMsgRecuperar.value = ''
    const res = await api.post('/auth/recuperar-info', {
      telefono: recuperarTelefono.value.trim()
    })
    correoCensurado.value = res.maskedEmail
    stepRecuperar.value = 2
  } catch (err) {
    errorMsgRecuperar.value = err.response?.data?.error || 'No pudimos encontrar tu información.'
  } finally {
    cargando.value = false
  }
}

const enviarLink = async () => {
  try {
    cargando.value = true
    errorMsgRecuperar.value = ''
    await api.post('/auth/enviar-link', {
      telefono: recuperarTelefono.value.trim(),
      correoConfirmacion: correoConfirmacion.value.trim()
    })
    stepRecuperar.value = 3
  } catch (err) {
    errorMsgRecuperar.value = err.response?.data?.error || 'Hubo un error al enviar el enlace.'
  } finally {
    cargando.value = false
  }
}

const volverAlLogin = () => {
  mostrandoRecuperar.value = false
  stepRecuperar.value = 1
  errorMsgRecuperar.value = ''
  recuperarTelefono.value = ''
  correoConfirmacion.value = ''
}
</script>

<style scoped>
.login-container {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
  background-color: #f7f9f8;
  font-family: 'Inter', sans-serif;
  background-image: radial-gradient(at 50% 0%, rgba(74,140,91,0.05) 0%, transparent 70%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid rgba(0,0,0,0.05);
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-badge {
  display: inline-block;
  background: #eaf3ed;
  color: #4a8c5b;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login-header h1 {
  font-size: 1.6rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-header p {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.5;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid #fecaca;
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
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s;
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
  width: 100%;
}

.btn-primary:hover {
  background: #3a7049;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-text {
  background: none;
  border: none;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all 0.2s;
}

.btn-text:hover {
  color: #4a8c5b;
  text-decoration-color: #4a8c5b;
}

.btn-link {
  color: #4a8c5b;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  margin-top: 0.25rem;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #111827;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
