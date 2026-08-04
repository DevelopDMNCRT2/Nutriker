<template>
  <div class="portal-page">
    <div class="container portal-container">

      <!-- Si no está autenticado / Cargando -->
      <div v-if="loading" class="loading-state">
        <p>Cargando información de tu expediente clínico...</p>
      </div>

      <div v-else-if="!paciente" class="unauth-state">
        <h2>Acceso Requerido</h2>
        <p>Por favor inicia sesión para consultar tu expediente y dietas.</p>
        <router-link to="/login" class="btn-primary">Iniciar Sesión</router-link>
      </div>

      <!-- Portal del Paciente -->
      <div v-else class="portal-content">
        <!-- Banner del Paciente -->
        <header class="patient-banner">
          <div class="patient-info">
            <span class="patient-badge">Expediente Clínico Activo</span>
            <h1 class="patient-name">¡Hola, {{ paciente.nombre }}!</h1>
            <p class="patient-sub">Bienvenido a tu portal nutricional personalizado en NutriKer.</p>
          </div>
          <button @click="cerrarSesion" class="btn-logout">Cerrar Sesión</button>
        </header>

        <!-- Grilla de Tarjetas Médicas y Antropométricas -->
        <div class="portal-grid">
          <!-- Tarjeta de Antropometría / IMC -->
          <div class="card metric-card">
            <h2 class="card-title">Mediciones Corporales</h2>
            <div class="metrics-row">
              <div class="metric-item">
                <span class="metric-label">Peso Actual</span>
                <strong class="metric-value">{{ paciente.peso ? paciente.peso + ' kg' : 'Sin registrar' }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">Estatura</span>
                <strong class="metric-value">{{ paciente.estatura ? paciente.estatura + ' m' : 'Sin registrar' }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">IMC Calculado</span>
                <strong class="metric-value highlight">{{ imcCalculado }}</strong>
              </div>
            </div>
            <p class="imc-categoria">{{ imcCategoria }}</p>
          </div>

          <!-- Tarjeta de Indicaciones Clínicas de la Dra. Karla -->
          <div class="card notes-card">
            <h2 class="card-title">Notas e Indicaciones Médicas</h2>
            <p class="notes-body">
              {{ paciente.notas || 'Recuerda mantener una hidratación de al menos 2 litros de agua al día y seguir las porciones indicadas en tu plan de alimentación.' }}
            </p>
            <span class="doctor-signature">— Dra. Alexa Lora (NutriKer)</span>
          </div>
        </div>

        <!-- Sección de Menú Semanal / Dieta -->
        <section class="diet-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Tu Plan Alimenticio Semanal</h2>
              <p class="section-sub">Menú personalizado asignado para tu tratamiento nutricional.</p>
            </div>
            <button v-if="menuSemanal" @click="imprimirMenu" class="btn-print">
              🖨️ Imprimir / Descargar Plan
            </button>
          </div>

          <!-- Si no tiene menú asignado -->
          <div v-if="!menuSemanal" class="empty-diet">
            <p>Aún no tienes un menú semanal asignado en tu expediente. La doctora lo actualizará en tu próxima consulta.</p>
          </div>

          <!-- Menú Semanal Detallado -->
          <div v-else class="diet-table-wrapper" id="seccion-menu-print">
            <table class="diet-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Desayuno</th>
                  <th>Comida</th>
                  <th>Cena</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="day-col">Lunes</td>
                  <td>{{ menuSemanal.lunes_desayuno || 'Porción libre de proteína y verduras' }}</td>
                  <td>{{ menuSemanal.lunes_comida || 'Pechuga asada con guarnición de nopal y ensalada' }}</td>
                  <td>{{ menuSemanal.lunes_cena || 'Cena ligera: Ensalada verde con atún' }}</td>
                </tr>
                <tr>
                  <td class="day-col">Martes</td>
                  <td>{{ menuSemanal.martes_desayuno || 'Avena cocida en agua con fruta de temporada' }}</td>
                  <td>{{ menuSemanal.martes_comida || 'Salmón a la plancha con verduras al vapor' }}</td>
                  <td>{{ menuSemanal.martes_cena || 'Yogur griego con semillas de chía' }}</td>
                </tr>
                <tr>
                  <td class="day-col">Miércoles</td>
                  <td>{{ menuSemanal.miercoles_desayuno || 'Licuado nutricional de proteína' }}</td>
                  <td>{{ menuSemanal.miercoles_comida || 'Filete de pescado con verduras' }}</td>
                  <td>{{ menuSemanal.miercoles_cena || 'Sopa de verduras casera' }}</td>
                </tr>
                <tr>
                  <td class="day-col">Jueves</td>
                  <td>{{ menuSemanal.jueves_desayuno || 'Huevos al gusto con espinacas' }}</td>
                  <td>{{ menuSemanal.jueves_comida || 'Pollo en salsa verde con nopales' }}</td>
                  <td>{{ menuSemanal.jueves_cena || 'Té relajante y tostada horneada' }}</td>
                </tr>
                <tr>
                  <td class="day-col">Viernes</td>
                  <td>{{ menuSemanal.viernes_desayuno || 'Omelette de claras con champiñones' }}</td>
                  <td>{{ menuSemanal.viernes_comida || 'Carne magra asada con ensalada' }}</td>
                  <td>{{ menuSemanal.viernes_cena || 'Cena libre baja en carbohidratos' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Historial de Citas -->
        <section class="citas-history-section">
          <h2 class="section-title">Historial de Citas</h2>
          <div v-if="citas.length === 0" class="empty-citas">
            <p>No cuentas con registros previos de citas en tu expediente.</p>
          </div>
          <div v-else class="citas-list">
            <div v-for="c in citas" :key="c.id" class="cita-card">
              <div class="cita-meta">
                <span class="cita-date">📅 {{ formatearFecha(c.fecha) }}</span>
                <span class="cita-time">🕐 {{ c.horario }} hrs</span>
              </div>
              <div class="cita-info">
                <strong>{{ c.servicio || 'Consulta Nutricional' }}</strong>
                <span class="cita-status" :class="c.estado ? c.estado.toLowerCase() : 'confirmada'">
                  {{ c.estado || 'Confirmada' }}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const paciente = ref(null)
const menuSemanal = ref(null)
const citas = ref([])
const loading = ref(true)

const cargarDatosPortal = async () => {
  const stored = localStorage.getItem('nutriker_paciente')
  if (!stored) {
    loading.value = false
    router.push('/login')
    return
  }

  try {
    const localPatient = JSON.parse(stored)
    paciente.value = localPatient
    const phoneParam = localPatient.telefono || ''
    const idParam = localPatient.id || ''
    const res = await api.get(`/public/paciente/portal?telefono=${encodeURIComponent(phoneParam)}&paciente_id=${encodeURIComponent(idParam)}`)
    if (res && res.paciente) paciente.value = res.paciente
    menuSemanal.value = res ? res.menuSemanal : null
    citas.value = res ? (res.citas || []) : []
  } catch (err) {
    console.error('Error al cargar portal de paciente:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDatosPortal()
})

const imcCalculado = computed(() => {
  if (!paciente.value || !paciente.value.peso || !paciente.value.estatura) return 'N/A'
  let p = parseFloat(paciente.value.peso)
  let e = parseFloat(paciente.value.estatura)
  if (e > 3) e = e / 100 // si está en cm
  const imc = p / (e * e)
  return imc.toFixed(1)
})

const imcCategoria = computed(() => {
  const imcVal = parseFloat(imcCalculado.value)
  if (isNaN(imcVal)) return ''
  if (imcVal < 18.5) return 'Peso Bajo'
  if (imcVal <= 25.0) return 'Peso Normal / Saludable'
  if (imcVal <= 29.9) return 'Sobrepeso'
  return 'Obesidad'
})

const cerrarSesion = () => {
  localStorage.removeItem('nutriker_paciente')
  router.push('/login')
}

const imprimirMenu = () => {
  window.print()
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.portal-page {
  min-height: 85vh;
  background-color: #f9fafb;
  padding: 3rem 1.5rem;
}

.portal-container {
  max-width: 1100px;
  margin: 0 auto;
}

.loading-state, .unauth-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #6b7280;
}

.patient-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
}

.patient-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.patient-name {
  font-size: 2rem;
  font-weight: 800;
}

.patient-sub {
  font-size: 0.9rem;
  opacity: 0.9;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.portal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (max-width: 768px) {
  .portal-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  padding: 1.75rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.metric-value.highlight {
  color: #10b981;
}

.imc-categoria {
  font-size: 0.85rem;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  display: inline-block;
}

.notes-body {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 1rem;
}

.doctor-signature {
  font-size: 0.8rem;
  font-weight: 700;
  color: #10b981;
}

.diet-section {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
}

.section-sub {
  font-size: 0.85rem;
  color: #6b7280;
}

.btn-print {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.diet-table-wrapper {
  overflow-x: auto;
}

.diet-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.diet-table th, .diet-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.diet-table th {
  background: #f9fafb;
  font-weight: 700;
  color: #374151;
}

.day-col {
  font-weight: 700;
  color: #10b981;
  width: 120px;
}

.citas-history-section {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  padding: 2rem;
}

.citas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.cita-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
}

.cita-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.cita-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cita-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  background: #d1fae5;
  color: #065f46;
}

@media print {
  body * {
    visibility: hidden;
  }
  #seccion-menu-print, #seccion-menu-print * {
    visibility: visible;
  }
  #seccion-menu-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
