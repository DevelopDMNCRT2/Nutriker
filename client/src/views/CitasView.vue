<template>
  <div class="citas-page">
    <!-- Hero Section -->
    <section class="citas-hero">
      <div class="container hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Reserva en Línea
        </div>
        <h1>Agendar <span class="text-highlight">Cita Nutricional</span></h1>
        <p>Proceso guiado paso a paso para reservar tu consulta con la Karla.</p>
      </div>
    </section>

    <!-- Main Wizard Section -->
    <section class="citas-wizard-section">
      <div class="container form-layout">
        <!-- Panel de Información Lateral -->
        <aside class="info-panel">
          <div class="info-card">
            <div class="info-icon">📍</div>
            <h3>Ubicación</h3>
            <p>Consultorio NutriKer, Ciudad de Guatemala</p>
          </div>
          <div class="info-card">
            <div class="info-icon">🕐</div>
            <h3>Horarios de atención</h3>
            <p>Lunes a Viernes<br><strong>8:00 AM – 6:00 PM</strong></p>
          </div>
          <div class="info-card">
            <div class="info-icon">📞</div>
            <h3>Contacto</h3>
            <p>Dudas o información sobre tu cita</p>
          </div>
        </aside>

        <!-- Tarjeta Principal del Wizard -->
        <div class="wizard-card">
          <!-- Stepper de Pasos -->
          <div v-if="!citaConfirmada" class="wizard-stepper">
            <div class="step-item" :class="{ active: pasoActual === 1, completed: pasoActual > 1 }">
              <div class="step-badge">1</div>
              <span class="step-label">Tus Datos</span>
            </div>
            <div class="step-line" :class="{ active: pasoActual > 1 }"></div>
            <div class="step-item" :class="{ active: pasoActual === 2, completed: pasoActual > 2 }">
              <div class="step-badge">2</div>
              <span class="step-label">Fecha y Horario</span>
            </div>
            <div class="step-line" :class="{ active: pasoActual > 2 }"></div>
            <div class="step-item" :class="{ active: pasoActual === 3, completed: citaConfirmada }">
              <div class="step-badge">3</div>
              <span class="step-label">Confirmación</span>
            </div>
          </div>



          <!-- PASO 1: Captura de Datos Personales y de Salud -->
          <div v-if="pasoActual === 1 && !citaConfirmada" class="wizard-step-content">
            <h2 class="step-title">Paso 1: Datos del Paciente</h2>
            <p class="step-desc">Ingresa tus datos personales para asociar tu expediente clínico.</p>

            <div class="form-grid">
              <div class="form-group full-width">
                <label>Nombre Completo *</label>
                <input
                  v-model="form.paciente_nombre"
                  type="text"
                  placeholder="Ej. Ana María López"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Correo Electrónico *</label>
                <input
                  v-model="form.paciente_email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Teléfono de Contacto (10 dígitos) *</label>
                <input
                  v-model="form.paciente_telefono"
                  type="tel"
                  maxlength="10"
                  placeholder="Ej. 5555123456"
                  @input="form.paciente_telefono = form.paciente_telefono.replace(/\D/g, '').slice(0, 10)"
                  class="form-input"
                />
              </div>

              <!-- CONTRASEÑA PARA ACCESO AL PORTAL -->
              <div class="form-group">
                <label>Contraseña para tu Portal *</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  minlength="6"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="Escríbela de nuevo"
                  minlength="6"
                  class="form-input"
                />
              </div>
            </div>

            <div class="wizard-actions flex-end">
              <button @click="irAlPaso2" class="btn-siguiente">
                Continuar a Selección de Horario &rarr;
              </button>
            </div>
          </div>

          <!-- PASO 2: Selección de Fecha y Horario -->
          <div v-if="pasoActual === 2 && !citaConfirmada" class="wizard-step-content">
            <h2 class="step-title">Paso 2: Fecha y Horario</h2>
            <p class="step-desc">Selecciona el día y la hora en que deseas asistir a tu consulta.</p>

            <div class="form-grid">
              <div class="form-group">
                <label>Fecha de la Cita *</label>
                <input
                  v-model="form.fecha"
                  type="date"
                  :min="fechaMinima"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Horario Disponible *</label>
                <select v-model="form.horario" class="form-input form-select" @change="errorMsg = ''">
                  <option value="" disabled>Selecciona un horario disponible</option>
                  <option
                    v-for="h in horariosPosibles"
                    :key="h"
                    :value="h"
                    :disabled="horariosOcupados.includes(h)"
                  >
                    {{ h }} hrs {{ horariosOcupados.includes(h) ? '(Ocupado - No disponible)' : '' }}
                  </option>
                </select>
              </div>
            </div>

            <div class="wizard-actions justify-between">
              <button @click="pasoActual = 1" class="btn-volver">&larr; Volver</button>
              <button @click="irAlPaso3" class="btn-siguiente">
                Revisar y Confirmar Cita &rarr;
              </button>
            </div>
          </div>

          <!-- PASO 3: Resumen Final antes de Guardar -->
          <div v-if="pasoActual === 3 && !citaConfirmada" class="wizard-step-content">
            <h2 class="step-title">Paso 3: Confirmación de Reserva</h2>
            <p class="step-desc">Revisa los datos de tu cita antes de finalizar la reserva.</p>

            <div class="resumen-box">
              <div class="resumen-item">
                <span class="resumen-label">Paciente:</span>
                <span class="resumen-val">{{ form.paciente_nombre }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Correo:</span>
                <span class="resumen-val">{{ form.paciente_email }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Teléfono:</span>
                <span class="resumen-val">{{ form.paciente_telefono }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Fecha Reservada:</span>
                <span class="resumen-val highlight">{{ formatearFecha(form.fecha) }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Horario:</span>
                <span class="resumen-val highlight">{{ form.horario }} hrs</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Tipo de Cita:</span>
                <span class="resumen-val">{{ form.atencion_previa === 'si' ? 'Paciente Recurrente' : 'Primera Consulta' }}</span>
              </div>
            </div>

            <div class="wizard-actions justify-between">
              <button @click="pasoActual = 2" :disabled="guardando" class="btn-volver">&larr; Volver</button>
              <button @click="confirmarYGuardarCita" :disabled="guardando" class="btn-confirmar">
                {{ guardando ? 'Guardando Cita...' : 'Confirmar Reserva de Cita' }}
              </button>
            </div>
          </div>

          <!-- PANTALLA DE ÉXITO DE CITA CONFIRMADA -->
          <div v-if="citaConfirmada" class="success-screen">
            <div class="success-badge-icon">✓</div>
            <h2>¡Cita Reservada Exitosamente!</h2>
            <p>Tu consulta médica con la Karla ha sido guardada en el sistema.</p>

            <div class="ticket-box">
              <div class="ticket-header">
                <span>Folio de Cita:</span>
                <strong>#{{ citaConfirmada.id }}</strong>
              </div>
              <div class="ticket-body">
                <p><strong>Paciente:</strong> {{ citaConfirmada.paciente_nombre }}</p>
                <p><strong>Fecha:</strong> {{ formatearFecha(citaConfirmada.fecha) }}</p>
                <p><strong>Horario:</strong> {{ citaConfirmada.horario }} hrs</p>
                <p><strong>Lugar:</strong> Consultorio NutriKer, Ciudad de Guatemala</p>
              </div>
            </div>

            <button @click="reiniciarWizard" class="btn-nueva-cita">Agendar Otra Cita</button>
          </div>
          <!-- Mensaje de Error / Alerta (Ubicado aquí para estar debajo del botón) -->
          <div v-if="errorMsg" class="error-banner mt-4">
            <span class="error-text">{{ errorMsg }}</span>
            <button @click="errorMsg = ''" class="btn-close-error">&times;</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../services/api'

const pasoActual = ref(1)
const guardando = ref(false)
const errorMsg = ref('')
const citaConfirmada = ref(null)
const horariosOcupados = ref([])

const cargarHorariosOcupados = async (fecha) => {
  if (!fecha) {
    horariosOcupados.value = []
    return
  }
  try {
    const res = await api.get(`/public/horarios-ocupados?fecha=${fecha}`)
    horariosOcupados.value = res.ocupados || []
    if (form.value.horario && horariosOcupados.value.includes(form.value.horario)) {
      form.value.horario = ''
    }
  } catch (err) {
    console.error('Error al cargar horarios ocupados:', err)
    horariosOcupados.value = []
  }
}

const fechaMinima = computed(() => {
  const options = { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(new Date())
  return `${parts.find(p=>p.type==='year').value}-${parts.find(p=>p.type==='month').value}-${parts.find(p=>p.type==='day').value}`
})

const horariosPosibles = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
]

const form = ref({
  paciente_nombre: '',
  paciente_email: '',
  paciente_telefono: '',
  fecha: new Date().toISOString().split('T')[0],
  horario: '',
  notas: '',
  password: '',
  confirmPassword: ''
})

watch(() => form.value.fecha, (nuevaFecha) => {
  if (nuevaFecha) cargarHorariosOcupados(nuevaFecha)
}, { immediate: true })

onMounted(() => {
  if (form.value.fecha) cargarHorariosOcupados(form.value.fecha)
})

const irAlPaso2 = () => {
  errorMsg.value = ''
  if (!form.value.paciente_nombre.trim()) {
    errorMsg.value = 'Por favor ingresa tu nombre completo.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.paciente_email.trim())) {
    errorMsg.value = 'Por favor ingresa un correo electrónico válido (ej. usuario@dominio.com).'
    return
  }
  if (!form.value.paciente_telefono || form.value.paciente_telefono.length !== 10) {
    errorMsg.value = 'El número de teléfono debe contener exactamente 10 dígitos.'
    return
  }

  if (!form.value.password || form.value.password.length < 6) {
    errorMsg.value = 'Debes crear una contraseña de al menos 6 caracteres.'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  pasoActual.value = 2
}

const irAlPaso3 = () => {
  errorMsg.value = ''
  if (!form.value.fecha) {
    errorMsg.value = 'Por favor selecciona una fecha para tu cita.'
    return
  }
  if (!form.value.horario) {
    errorMsg.value = 'Por favor selecciona un horario disponible.'
    return
  }
  pasoActual.value = 3
}

const confirmarYGuardarCita = async () => {
  try {
    guardando.value = true
    errorMsg.value = ''

    const payload = {
      paciente_nombre: form.value.paciente_nombre.trim(),
      correo: form.value.paciente_email.trim(),
      paciente_telefono: form.value.paciente_telefono.replace(/\D/g, ''),
      fecha: form.value.fecha,
      horario: form.value.horario
    }

    const res = await api.post('/public/citas', payload)
    citaConfirmada.value = res.cita || { id: res.id || 'N/A', ...payload }
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.message || 'Error al agendar la cita. Por favor intenta con otro horario.'
  } finally {
    guardando.value = false
  }
}

const reiniciarWizard = () => {
  citaConfirmada.value = null
  pasoActual.value = 1
  form.value = {
    paciente_nombre: '',
    paciente_email: '',
    paciente_telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    horario: ''
  }
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}
</script>

<style scoped>
.citas-page {
  min-height: 85vh;
  background-color: #f9fafb;
}

.citas-hero {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 3rem 1.5rem;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background-color: #34d399;
  border-radius: 50%;
}

.text-highlight {
  color: #a7f3d0;
}

.citas-wizard-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.info-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.info-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.info-card p {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.wizard-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

/* Stepper */
.wizard-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.step-item.active {
  color: #10b981;
}

.step-item.active .step-badge {
  background: #10b981;
  color: white;
}

.step-item.completed {
  color: #059669;
}

.step-item.completed .step-badge {
  background: #059669;
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 1rem;
}

.step-line.active {
  background: #10b981;
}

/* Step Content */
.step-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.step-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.full-width {
  grid-column: 1 / -1;
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
  padding: 0.65rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 0.9rem;
}

.radio-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.radio-card {
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.radio-card.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.75rem;
}

.btn-horario {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-horario.selected {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.wizard-actions {
  display: flex;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.flex-end {
  justify-content: flex-end;
}

.justify-between {
  justify-content: space-between;
}

.btn-siguiente, .btn-confirmar {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-volver {
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.resumen-box {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.resumen-label {
  color: #6b7280;
}

.resumen-val {
  font-weight: 600;
  color: #111827;
}

.resumen-val.highlight {
  color: #10b981;
  font-weight: 800;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.btn-close-error {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #dc2626;
}

.success-screen {
  text-align: center;
  padding: 2rem 1rem;
}

.success-badge-icon {
  width: 50px;
  height: 50px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.ticket-box {
  max-width: 400px;
  margin: 1.5rem auto;
  border: 1px dashed #10b981;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #f0fdf4;
  text-align: left;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #a7f3d0;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.ticket-body p {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.btn-nueva-cita {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
