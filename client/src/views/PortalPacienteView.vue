<template>
  <div class="portal-container container">

    <!-- ── VISTA DE AUTENTICACIÓN (LOGIN) ── -->
    <div v-if="!paciente" class="portal-login-card">
      <div class="portal-header text-center">
        <div class="portal-icon-wrapper">
          <svg class="portal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h1 class="portal-title">Portal del Paciente</h1>
        <p class="portal-subtitle">Ingresa tu correo registrado, número de teléfono o ID de expediente para consultar tu menú y evolución.</p>
      </div>

      <form @submit.prevent="iniciarSesion" class="portal-form">
        <div class="form-group">
          <label for="identificador-input" class="form-label">Correo, Teléfono o ID de Expediente</label>
          <input
            id="identificador-input"
            v-model="identificador"
            type="text"
            required
            placeholder="ej. correo@ejemplo.com o 5512345678"
            class="form-input"
          />
        </div>

        <div v-if="errorLogin" class="alert-error">
          {{ errorLogin }}
        </div>

        <button type="submit" :disabled="cargando" class="btn btn-primary btn-block">
          {{ cargando ? 'Verificando...' : 'Ingresar a mi Portal' }}
        </button>
      </form>
    </div>

    <!-- ── VISTA DEL PORTAL (PACIENTE AUTENTICADO) ── -->
    <div v-else class="portal-dashboard">
      
      <!-- Encabezado de Bienvenida -->
      <div class="portal-welcome-header">
        <div>
          <span class="badge-paciente">Expediente #{{ paciente.id }}</span>
          <h1 class="welcome-name">Hola, {{ paciente.nombre }}</h1>
          <p class="welcome-sub">{{ paciente.correo || paciente.telefono }}</p>
        </div>
        <button @click="cerrarSesion" class="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <!-- Pestañas -->
      <div class="portal-tabs">
        <button
          @click="tabActiva = 'menu'"
          :class="['tab-btn', { active: tabActiva === 'menu' }]"
        >
          Mi Menú Semanal
        </button>
        <button
          @click="tabActiva = 'expediente'"
          :class="['tab-btn', { active: tabActiva === 'expediente' }]"
        >
          Mi Evolución y Expediente
        </button>
      </div>

      <!-- CONTENIDO PESTAÑA 1: MENÚ SEMANAL -->
      <div v-if="tabActiva === 'menu'" class="tab-content">
        <div v-if="cargandoMenu" class="loading-state">
          Cargando tu plan nutricional...
        </div>

        <div v-else-if="!menuActivo" class="empty-card text-center">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="empty-title">Aún no tienes un menú semanal asignado.</p>
          <p class="empty-sub">Tu nutrióloga lo publicará aquí en tu próxima consulta.</p>
        </div>

        <div v-else class="menu-wrapper">
          <div class="menu-banner">
            <div>
              <span class="banner-tag">Plan Nutricional Activo</span>
              <h2 class="banner-title">{{ menuActivo.nombre }}</h2>
              <p class="banner-sub">Semana de inicio: {{ menuActivo.semanaInicio }}</p>
            </div>
          </div>

          <!-- Días de la semana -->
          <div class="dias-grid">
            <div
              v-for="dia in diasSemana"
              :key="dia.key"
              class="dia-card"
            >
              <div class="dia-header">
                <h3>{{ dia.label }}</h3>
              </div>

              <div class="tiempos-list">
                <div v-for="tiempo in tiemposComida" :key="tiempo.key" class="tiempo-item">
                  <span class="tiempo-label">{{ tiempo.label }}</span>
                  <div class="tiempo-val">
                    {{ menuActivo[`${dia.key}_${tiempo.key}`] || 'Libre / No especificado' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="menuActivo.notas" class="notas-card">
            <h4>Indicaciones Especiales de la Nutrióloga</h4>
            <p>{{ menuActivo.notas }}</p>
          </div>
        </div>
      </div>

      <!-- CONTENIDO PESTAÑA 2: EXPEDIENTE -->
      <div v-if="tabActiva === 'expediente'" class="tab-content">
        <div class="expediente-card">
          <h3 class="card-title">Resumen de Expediente Clínico</h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Paciente</span>
              <span class="info-val">{{ datosPaciente?.nombre || paciente.nombre }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-val">{{ datosPaciente?.telefono || paciente.telefono }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Edad / Estatura</span>
              <span class="info-val">
                {{ datosPaciente?.edad ? datosPaciente.edad + ' años' : 'N/A' }} | {{ datosPaciente?.estatura ? datosPaciente.estatura + ' m' : 'N/A' }}
              </span>
            </div>
          </div>

          <div v-if="datosPaciente?.motivo_consulta" class="motivo-card">
            <h4>Objetivo / Motivo de Consulta</h4>
            <p>{{ datosPaciente.motivo_consulta }}</p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const identificador = ref('')
const cargando = ref(false)
const errorLogin = ref('')

const paciente = ref(null)
const datosPaciente = ref(null)
const menuActivo = ref(null)
const cargandoMenu = ref(false)

const tabActiva = ref('menu')

const diasSemana = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const tiemposComida = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'colacion_am', label: 'Colación AM' },
  { key: 'comida', label: 'Comida' },
  { key: 'colacion_pm', label: 'Colación PM' },
  { key: 'cena', label: 'Cena' },
]

async function iniciarSesion() {
  if (!identificador.value.trim()) return
  cargando.value = true
  errorLogin.value = ''

  try {
    const res = await api.post('/auth/login-paciente', {
      email: identificador.value.trim()
    })
    
    paciente.value = res.paciente
    localStorage.setItem('paciente_token', res.token)
    localStorage.setItem('paciente_data', JSON.stringify(res.paciente))

    await cargarDatosPortal(res.paciente.id)
  } catch (err) {
    console.error('Error al iniciar sesión:', err)
    errorLogin.value = err.response?.data?.error || 'No fue posible iniciar sesión. Verifica tu información.'
  } finally {
    cargando.value = false
  }
}

async function cargarDatosPortal(pacienteId) {
  cargandoMenu.value = true
  try {
    const pacienteRes = await api.get(`/pacientes/${pacienteId}`).catch(() => null)
    datosPaciente.value = pacienteRes

    const menusRes = await api.get(`/menus/paciente/${pacienteId}`).catch(() => [])
    if (Array.isArray(menusRes) && menusRes.length > 0) {
      menuActivo.value = menusRes[0]
    }
  } catch (err) {
    console.error('Error cargando portal:', err)
  } finally {
    cargandoMenu.value = false
  }
}

function cerrarSesion() {
  paciente.value = null
  datosPaciente.value = null
  menuActivo.value = null
  localStorage.removeItem('paciente_token')
  localStorage.removeItem('paciente_data')
}

onMounted(() => {
  const saved = localStorage.getItem('paciente_data')
  if (saved) {
    try {
      paciente.value = JSON.parse(saved)
      cargarDatosPortal(paciente.value.id)
    } catch (e) {
      localStorage.removeItem('paciente_data')
    }
  }
})
</script>

<style scoped>
.portal-container {
  padding-top: 3rem;
  padding-bottom: 5rem;
  min-height: 70vh;
}

/* --- Card Login --- */
.portal-login-card {
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.portal-icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: rgba(74, 140, 91, 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.portal-icon {
  width: 28px;
  height: 28px;
}

.portal-title {
  font-size: 1.85rem;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
}

.portal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-light);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.portal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1.5px solid #e2ded8;
  font-family: var(--font-main);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
  background-color: var(--color-bg);
}

.form-input:focus {
  border-color: var(--color-primary);
  background-color: var(--color-white);
  box-shadow: 0 0 0 3px rgba(74, 140, 91, 0.15);
}

.btn-block {
  width: 100%;
  margin-top: 0.5rem;
}

.alert-error {
  padding: 0.75rem 1rem;
  background-color: #fde8e8;
  border: 1px solid #f8b4b4;
  color: #9b1c1c;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
}

/* --- Dashboard --- */
.portal-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.portal-welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-white);
  padding: 1.75rem 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.badge-paciente {
  font-size: 0.75rem;
  font-weight: 700;
  background-color: rgba(168, 74, 84, 0.1);
  color: var(--color-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.welcome-name {
  font-size: 1.75rem;
  color: var(--color-text);
  margin-top: 0.25rem;
}

.welcome-sub {
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.btn-logout {
  background-color: #fce8e6;
  color: var(--color-secondary);
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

/* Tabs */
.portal-tabs {
  display: flex;
  gap: 1.5rem;
  border-bottom: 2px solid #e8e4dc;
}

.tab-btn {
  background: none;
  border: none;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-light);
  padding-bottom: 0.75rem;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab-btn.active {
  color: var(--color-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 3px 3px 0 0;
}

/* Tab Content */
.menu-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-white);
  padding: 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.banner-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.banner-title {
  color: var(--color-white);
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.banner-sub {
  font-size: 0.85rem;
  opacity: 0.9;
}

.dias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.dia-card {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dia-header h3 {
  font-size: 1.1rem;
  color: var(--color-primary);
  border-bottom: 1px solid #f0ece5;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.tiempos-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tiempo-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tiempo-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.tiempo-val {
  font-size: 0.85rem;
  background-color: var(--color-bg);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: var(--color-text);
  line-height: 1.4;
}

.notas-card {
  background-color: #fff9e6;
  border: 1px solid #ffe699;
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.notas-card h4 {
  font-size: 0.9rem;
  color: #856404;
  margin-bottom: 0.25rem;
}

.notas-card p {
  font-size: 0.85rem;
  color: #533f03;
}

.expediente-card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 1.3rem;
  color: var(--color-secondary);
  border-bottom: 1px solid #f0ece5;
  padding-bottom: 0.75rem;
  margin-bottom: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  background-color: var(--color-bg);
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.info-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 0.2rem;
}

.motivo-card {
  background-color: rgba(74, 140, 91, 0.08);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.motivo-card h4 {
  font-size: 0.9rem;
  color: var(--color-primary);
}

.motivo-card p {
  font-size: 0.9rem;
  color: var(--color-text);
  margin-top: 0.25rem;
}

.empty-card {
  background-color: var(--color-white);
  padding: 3rem 1.5rem;
  border-radius: var(--radius-lg);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
}

.empty-title {
  font-weight: 700;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--color-text-light);
}
</style>
