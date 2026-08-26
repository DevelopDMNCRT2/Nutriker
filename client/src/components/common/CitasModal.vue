<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="appStore.isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content scale-in form-editorial">
          <button class="close-btn" @click="closeModal" aria-label="Cerrar modal"><X :size="24" /></button>
          
          <div class="modal-header">
            <h2>Expediente Clínico</h2>
            <p>Descubrir tu biología es el primer paso.</p>
            
            <!-- Progress indicator -->
            <div class="progress-bar mt-3">
              <div class="progress" :style="{ width: `${(step / 5) * 100}%` }"></div>
            </div>
            <div class="step-indicator">Paso {{ step }} de 5: {{ stepTitles[step-1] }}</div>
          </div>

          <form @submit.prevent="submitForm">
            <div class="scroll-container">
              <!-- STEP 1: Identificación -->
              <div v-show="step === 1" class="step-content">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Nombre Completo *</label>
                    <input type="text" v-model="formData.nombre" placeholder="Ana Pérez" required />
                  </div>
                  <div class="form-group flex-1">
                    <label>Teléfono *</label>
                    <input type="tel" v-model="formData.telefono" @input="formData.telefono = formData.telefono.replace(/\D/g, '')" maxlength="10" placeholder="Ej. 5512345678" required />
                  </div>
                </div>

                  <div class="form-group flex-1">
                    <label>Correo Electrónico *</label>
                    <input type="email" v-model="formData.correo" placeholder="ana@ejemplo.com" required />
                  </div>
                  <div class="form-group" style="width: 120px;">
                    <label>Edad</label>
                    <input type="number" v-model="formData.edad" placeholder="Años" min="10" max="100" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Contraseña para tu Portal *</label>
                    <input type="password" v-model="formData.password" placeholder="Mínimo 6 caracteres" required />
                  </div>
                  <div class="form-group flex-1">
                    <label>Confirmar Contraseña *</label>
                    <input type="password" v-model="formData.confirmPassword" placeholder="Confirma tu contraseña" required />
                  </div>
                </div>

                <div class="form-group">
                  <label>Ocupación Actual (Rutina)</label>
                  <input type="text" v-model="formData.ocupacion" placeholder="Ej. Oficinista, Atleta, Estudiante" />
                </div>

                <div class="form-group">
                  <label>Motivo Central de la Consulta *</label>
                  <textarea v-model="formData.motivo_consulta" rows="2" placeholder="Ej. Pérdida de peso, recomposición, salud metabólica..." required></textarea>
                </div>
              </div>

              <!-- STEP 2: Antecedentes -->
              <div v-show="step === 2" class="step-content">
                <div class="form-group">
                  <label>Patologías Actuales</label>
                  <textarea v-model="formData.patologias" rows="2" placeholder="Ej. Diabetes, Hipertensión, SOP, Ninguna..."></textarea>
                </div>

                <div class="form-group">
                  <label>Antecedentes Familiares (Padres/Abuelos)</label>
                  <textarea v-model="formData.antecedentes_familiares" rows="2" placeholder="Enfermedades crónicas en la familia..."></textarea>
                </div>

                <div class="form-group">
                  <label>Datos Bioquímicos Recientes</label>
                  <input type="text" v-model="formData.bioquimicos" placeholder="Colesterol, glucosa, triglicéridos si los conoces..." />
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Fármacos o Suplementos</label>
                    <input type="text" v-model="formData.farmacos" placeholder="¿Qué tomas actualmente?" />
                  </div>
                  <div class="form-group flex-1">
                    <label>Salud Digestiva</label>
                    <input type="text" v-model="formData.digestiva" placeholder="Inflamación, frecuencia de evacuación..." />
                  </div>
                </div>
              </div>

              <!-- STEP 3: Antropometría -->
              <div v-show="step === 3" class="step-content">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Peso Actual (kg)</label>
                    <input type="number" v-model="formData.peso" placeholder="70" />
                  </div>
                  <div class="form-group flex-1">
                    <label>Estatura (cm)</label>
                    <input type="number" v-model="formData.estatura" placeholder="170" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Circunferencias (Cintura, cadera, brazo)</label>
                  <input type="text" v-model="formData.circunferencias" placeholder="Si tienes tus medidas, escríbelas aquí..." />
                </div>

                <div class="form-group">
                  <label>Composición Corporal (Grasa, músculo)</label>
                  <input type="text" v-model="formData.composicion" placeholder="Si tienes un inbody o cálculo reciente..." />
                </div>
              </div>

              <!-- STEP 4: Estilo Dietético -->
              <div v-show="step === 4" class="step-content">
                <div class="form-group">
                  <label>Recordatorio de 24 horas</label>
                  <textarea v-model="formData.recordatorio_24h" rows="2" placeholder="Describe brevemente qué comiste en tu día de ayer..."></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Alergias o Intolerancias</label>
                    <input type="text" v-model="formData.alergias" placeholder="Lácteos, gluten, mariscos..." />
                  </div>
                  <div class="form-group flex-1">
                    <label>Consumo Ultraprocesados</label>
                    <input type="text" v-model="formData.ultraprocesados" placeholder="¿Con qué frecuencia (días a la semana)?" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Gustos y Aversiones</label>
                  <textarea v-model="formData.gustos" rows="2" placeholder="Alimentos que amas y alimentos que detestas..."></textarea>
                </div>
                
                <div class="form-group">
                  <label>Logística: ¿Quién cocina y dónde sueles comer?</label>
                  <input type="text" v-model="formData.logistica_cocina" placeholder="Ej. Cocino yo en casa, o como en la calle por trabajo..." />
                </div>
              </div>

              <!-- STEP 5: Fecha y Estilo de Vida -->
              <div v-show="step === 5" class="step-content">
                <div class="form-group">
                  <label>Estilo de Vida (Sueño, Ejercicio, Tabaco/Alcohol, Estrés)</label>
                  <textarea v-model="formData.estilo_vida" rows="2" placeholder="¿Cuántas horas duermes? ¿Haces pesas? ¿Nivel de estrés del 1 al 10?"></textarea>
                </div>
                
                <div class="divider">Selecciona la Fecha *</div>

                <div class="form-row" style="gap: 2rem;">
                  <div class="form-group flex-1" style="max-width: 200px;">
                    <label>Día Deseado</label>
                    <div class="input-with-icon">
                      <CalendarDays :size="16" class="input-icon" />
                      <input type="date" v-model="formData.fecha" :min="fechaMinima" required />
                    </div>
                  </div>

                  <div class="form-group flex-1" style="max-width: 200px;">
                    <label>Horario</label>
                    <div class="input-with-icon">
                      <Clock :size="16" class="input-icon" />
                      <select v-model="formData.horario" :disabled="!formData.fecha" required>
                        <option value="" disabled>{{ !formData.fecha ? 'Selecciona fecha' : 'Elige horario' }}</option>
                        <option v-for="h in TODOS_LOS_HORARIOS" :key="h" :value="h">
                          {{ h }} hrs
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Navigation -->
            <div class="modal-actions form-row mt-4">
              <button type="button" class="btn btn-outline" v-if="step > 1" @click="step--">Atrás</button>
              
              <button type="button" class="btn btn-primary flex-1 flex-center" v-if="step < 5" @click="nextStep" :disabled="!canProceed">
                Siguiente Paso <ArrowRight :size="18" class="ml-2" />
              </button>

              <button type="submit" class="btn btn-secondary flex-1 flex-center" v-if="step === 5" :disabled="isSubmitting || !canProceed">
                <span v-if="isSubmitting" class="spinner mr-2"></span>
                <CheckCircle v-else :size="18" class="mr-2" /> Finalizar y Agendar
              </button>
            </div>
          </form>

          <!-- Éxito Local -->
          <Transition name="fade">
            <div v-if="showSuccess" class="success-overlay">
              <div class="success-inner">
                <CheckCircle :size="56" class="success-icon" />
                <h3>¡Solicitud Recibida!</h3>
                <p>Tu expediente fue guardado. La Nutrióloga se pondrá en contacto pronto.</p>
              </div>
            </div>
          </Transition>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { X, CalendarDays, Clock, ArrowRight, CheckCircle } from 'lucide-vue-next'
import api from '../../services/api'

const appStore = useAppStore()

const step = ref(1)
const stepTitles = [
  'Identidad', 
  'Antecedentes', 
  'Antropometría', 
  'Dieta', 
  'Cita'
]

const TODOS_LOS_HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
]

const formData = ref({
  nombre: '', telefono: '', correo: '', edad: '', ocupacion: '', motivo_consulta: '',
  patologias: '', antecedentes_familiares: '', bioquimicos: '', farmacos: '', digestiva: '',
  peso: '', estatura: '', circunferencias: '', composicion: '',
  recordatorio_24h: '', alergias: '', ultraprocesados: '', gustos: '', logistica_cocina: '',
  estilo_vida: '',
  fecha: '', horario: '',
  atencionPrevia: 'no',
  password: '', confirmPassword: ''
})

const fechaMinima = computed(() => {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() + 1)
  return hoy.toISOString().split('T')[0]
})

const closeModal = () => {
  appStore.toggleModal(false)
  setTimeout(() => { step.value = 1 }, 400)
}

const canProceed = computed(() => {
  if (step.value === 1) {
    const isBasicValid = formData.value.nombre && formData.value.telefono && formData.value.correo && formData.value.motivo_consulta
    const isPasswordValid = formData.value.password && formData.value.password.length >= 6 && formData.value.password === formData.value.confirmPassword
    return isBasicValid && isPasswordValid
  }
  if (step.value === 5) {
    return formData.value.fecha && formData.value.horario
  }
  return true
})

const nextStep = () => {
  if (canProceed.value && step.value < 5) step.value++
}

const isSubmitting = ref(false)
const showSuccess = ref(false)

const submitForm = async () => {
  try {
    isSubmitting.value = true
    
    // Empaquetar toda la información extra en "notas"
    const extraInfo = {
      edad: formData.value.edad,
      ocupacion: formData.value.ocupacion,
      motivo_consulta: formData.value.motivo_consulta,
      patologias: formData.value.patologias,
      antecedentes_familiares: formData.value.antecedentes_familiares,
      bioquimicos: formData.value.bioquimicos,
      farmacos: formData.value.farmacos,
      digestiva: formData.value.digestiva,
      circunferencias: formData.value.circunferencias,
      composicion: formData.value.composicion,
      recordatorio_24h: formData.value.recordatorio_24h,
      alergias: formData.value.alergias,
      ultraprocesados: formData.value.ultraprocesados,
      gustos: formData.value.gustos,
      logistica_cocina: formData.value.logistica_cocina,
      estilo_vida: formData.value.estilo_vida
    }
    const notasString = JSON.stringify(extraInfo, null, 2)

    const payload = {
      paciente_nombre: formData.value.nombre.trim(),
      paciente_telefono: formData.value.telefono.replace(/\D/g, ''),
      correo: formData.value.correo.trim(),
      fecha: formData.value.fecha,
      horario: formData.value.horario,
      peso: formData.value.peso ? parseFloat(formData.value.peso) : null,
      estatura: formData.value.estatura ? (parseFloat(formData.value.estatura) > 3 ? parseFloat(formData.value.estatura)/100 : parseFloat(formData.value.estatura)) : null,
      notas: notasString,
      password: formData.value.password,
      atencion_previa: formData.value.atencionPrevia
    }

    await api.post('/public/citas', payload)

    isSubmitting.value = false
    showSuccess.value = true
    
    setTimeout(() => {
      showSuccess.value = false
      closeModal()
      Object.keys(formData.value).forEach(k => formData.value[k] = '')
      formData.value.atencionPrevia = 'no'
    }, 2500)
  } catch (err) {
    console.error('Error al guardar la cita:', err)
    alert(err.response?.data?.error || 'Error al agendar la cita. Es posible que el horario ya se haya ocupado.')
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 32, 39, 0.85);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: var(--color-bg);
  border-radius: 0;
  width: 100%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Para prevenir que salga de pantalla */
}

.scroll-container {
  overflow-y: auto;
  padding: 2rem 2.5rem;
  flex: 1;
}

.scroll-container::-webkit-scrollbar { width: 4px; }
.scroll-container::-webkit-scrollbar-thumb { background: var(--color-primary-light); }

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
  z-index: 10;
  opacity: 0.6;
}
.close-btn:hover { opacity: 1; }

.modal-header {
  background: var(--color-secondary);
  color: white;
  padding: 3rem 2.5rem 1.5rem;
}

.modal-header h2 {
  font-family: var(--font-serif);
  font-size: 2.2rem;
  color: white;
  font-weight: 400;
  margin-bottom: 0.2rem;
  letter-spacing: -1px;
}

.modal-header p {
  color: rgba(255,255,255,0.7);
  font-size: 0.95rem;
  font-family: var(--font-main);
}

.progress-bar {
  background: rgba(255,255,255,0.1);
  height: 4px;
  margin-top: 1.5rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--color-primary-light);
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.step-indicator {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-top: 0.5rem;
  letter-spacing: 1px;
}

form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.4rem;
}

input[type="text"], input[type="tel"], input[type="email"], input[type="number"], input[type="date"], select, textarea {
  width: 100%;
  padding: 0.8rem 0;
  border: none;
  border-bottom: 1px solid rgba(74, 140, 91, 0.2);
  background: transparent;
  font-size: 1rem;
  color: var(--color-text);
  font-family: var(--font-main);
  transition: border-color 0.3s;
  border-radius: 0;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-bottom: 1px solid var(--color-primary);
}

textarea {
  resize: vertical;
  min-height: 50px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon input, .input-with-icon select {
  padding-left: 2rem;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  color: var(--color-primary-dark);
  opacity: 0.5;
}

.divider {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  color: var(--color-secondary);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 0.5rem;
  margin: 1rem 0 1.5rem;
}

.modal-actions {
  padding: 0 2.5rem 2rem;
  background: var(--color-bg);
  align-items: center;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-primary-light);
  color: var(--color-primary);
}
.btn-outline:hover {
  background: var(--color-primary-light);
  color: white;
}

.btn-primary {
  border-radius: 0; 
  background: var(--color-primary);
}
.btn-secondary {
  border-radius: 0; 
  background: var(--color-secondary);
}

.flex-1 { flex: 1; }
.flex-center { display: flex; justify-content: center; align-items: center; }
.ml-2 { margin-left: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(15px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.success-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 20;
  border-radius: inherit;
}

.success-inner { padding: 3rem; }

.success-icon {
  color: var(--color-primary);
  margin: 0 auto 1.5rem;
}

.success-inner h3 {
  font-family: var(--font-serif);
  font-size: 2rem;
  color: var(--color-secondary);
  margin-bottom: 1rem;
}

.success-inner p {
  color: #666;
  font-size: 1rem;
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>
