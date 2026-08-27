<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-brand-500 selection:text-white dark:bg-gray-950">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </div>
      </div>
      <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight dark:text-white">
        NutriKer
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
        Reserva tu consulta de valoración nutricional (40 min).
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
        
        <div v-if="success" class="text-center py-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
            <svg class="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Cita Reservada!</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Te hemos enviado un correo con los detalles. Nos vemos el <strong>{{ form.fecha }}</strong> a las <strong>{{ form.horario }}</strong>.</p>
          <button @click="resetForm" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-gray-700">
            Agendar Otra Cita
          </button>
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 flex items-center gap-2 dark:bg-rose-900/30 dark:text-rose-400">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ errorMsg }}
          </div>

          <!-- Datos del Paciente -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo *</label>
              <div class="mt-1">
                <input v-model="form.nombre" type="text" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="Ej. Juan Pérez">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</label>
                <div class="mt-1">
                  <input v-model="form.telefono" type="tel" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="10 dígitos">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo *</label>
                <div class="mt-1">
                  <input v-model="form.correo" type="email" required class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="correo@ejemplo.com">
                </div>
              </div>

            </div>
          </div>

          <hr class="border-gray-200 dark:border-gray-800">

          <!-- Selección de Fecha y Hora -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecciona una Fecha *</label>
              <div class="flex justify-center">
                <div class="flatpickr-wrapper bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 inline-block p-2 shadow-sm">
                  <flat-pickr
                    v-model="form.fecha"
                    :config="fpConfig"
                    class="hidden"
                    @on-change="fetchHorariosOcupados"
                  />
                </div>
              </div>
            </div>

            <div v-if="form.fecha">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Horarios Disponibles *</label>
              <div v-if="loadingHorarios" class="flex justify-center py-4">
                <svg class="animate-spin h-6 w-6 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                <template v-for="hora in HORARIOS_DISPONIBLES" :key="hora">
                  <button 
                    v-if="!horariosOcupados.includes(hora)"
                    type="button"
                    @click="form.horario = hora"
                    :class="[
                      form.horario === hora ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/30' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-brand-500',
                      'border rounded-xl py-2 px-1 text-sm font-semibold transition-all duration-200'
                    ]"
                  >
                    {{ hora }}
                  </button>
                </template>
                <div v-if="todosOcupados" class="col-span-full text-center py-4 text-sm text-gray-500">
                  No hay horarios disponibles para esta fecha.
                </div>
              </div>
            </div>
          </div>

          <!-- Captcha simple -->
          <div v-if="form.horario" class="bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verificación de seguridad: ¿Cuánto es {{ captcha.a }} + {{ captcha.b }}?</label>
            <input v-model.number="captcha.answer" type="number" required class="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="Tu respuesta">
          </div>

          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
              Al completar tu registro reconoces conocer y aceptar el 
              <router-link to="/aviso-privacidad" target="_blank" class="text-brand-600 hover:text-brand-500 hover:underline dark:text-brand-400">aviso de privacidad</router-link>.
            </div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-brand-500/20 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ loading ? 'Agendando...' : 'Confirmar Cita' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { publicApi, citasApi } from '@/api/index.js'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
// @ts-ignore
import { Spanish } from 'flatpickr/dist/l10n/es.js'

// Flatpickr inline config
const fpConfig = {
  locale: Spanish,
  minDate: 'today',
  dateFormat: 'Y-m-d',
  inline: true,
  disableMobile: true,
  theme: 'light'
}

// 40 min blocks (approved schedule)
const HORARIOS_DISPONIBLES = [
  '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', '13:20', '14:00',
  '15:20', '16:00', '16:40'
]

const today = new Date().toISOString().split('T')[0]

const form = ref({
  nombre: '',
  telefono: '',
  correo: '',
  fecha: '',
  horario: ''
})

const success = ref(false)
const loading = ref(false)
const loadingHorarios = ref(false)
const errorMsg = ref('')
const horariosOcupados = ref<string[]>([])

const captcha = ref({ a: 0, b: 0, answer: null as number | null })

const todosOcupados = computed(() => {
  if (!form.value.fecha || horariosOcupados.value.length === 0) return false
  return HORARIOS_DISPONIBLES.every(h => horariosOcupados.value.includes(h))
})

function generateCaptcha() {
  captcha.value.a = Math.floor(Math.random() * 10) + 1
  captcha.value.b = Math.floor(Math.random() * 10) + 1
  captcha.value.answer = null
}

async function fetchHorariosOcupados() {
  form.value.horario = '' // reset
  errorMsg.value = ''
  if (!form.value.fecha) return

  loadingHorarios.value = true
  try {
    const data = await citasApi.getHorariosOcupados(form.value.fecha)
    // El backend devuelve { ocupados: ['08:00', '09:00'] }
    horariosOcupados.value = data.ocupados || []
  } catch (err: any) {
    console.error('Error fetching horarios:', err)
    horariosOcupados.value = []
  } finally {
    loadingHorarios.value = false
  }
}

async function handleSubmit() {
  errorMsg.value = ''
  

  
  if (!form.value.horario) {
    errorMsg.value = 'Por favor selecciona un horario disponible.'
    return
  }
  
  if (captcha.value.answer !== (captcha.value.a + captcha.value.b)) {
    errorMsg.value = 'Respuesta de seguridad incorrecta. Inténtalo de nuevo.'
    generateCaptcha()
    return
  }

  loading.value = true
  try {
    await publicApi.createCita({
      paciente_nombre: form.value.nombre,
      paciente_telefono: form.value.telefono,
      correo: form.value.correo,
      fecha: form.value.fecha,
      horario: form.value.horario
    })
    success.value = true
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al agendar la cita. Es posible que el horario ya se haya ocupado.'
    fetchHorariosOcupados() // Refresh
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { nombre: '', telefono: '', correo: '', fecha: '', horario: '' }
  success.value = false
  horariosOcupados.value = []
  generateCaptcha()
}

onMounted(() => {
  generateCaptcha()
})
</script>

<style>
/* Personalización de Flatpickr para que luzca integrado */
.flatpickr-wrapper .flatpickr-calendar {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 auto;
}
.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
  background: #10b981 !important;
  border-color: #10b981 !important;
}
.flatpickr-day {
  border-radius: 8px !important;
}
.flatpickr-months .flatpickr-month {
  height: 48px;
}
.flatpickr-current-month {
  font-size: 1.1rem;
  font-weight: 700;
  padding-top: 10px;
}
</style>
