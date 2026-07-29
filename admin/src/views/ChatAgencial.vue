<template>
  <AdminLayout>
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Asistente Clínico Inteligente</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              Gemini Flash IA
            </span>
          </h1>
        </div>
      </div>

      <!-- Selector de Paciente -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
          Seleccionar Paciente de Consulta *
        </label>
        <select
          v-model="clienteSeleccionadoId"
          @change="alCambiarCliente"
          class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
        >
          <option value="">-- Selecciona un paciente registrado --</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">
            {{ c.nombre }} {{ c.telefono ? `(${c.telefono})` : '' }}
          </option>
        </select>

        <div v-if="clienteActual" class="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs flex flex-wrap justify-between items-center gap-2">
          <div>
            <span class="font-bold text-gray-800 dark:text-white">{{ clienteActual.nombre }}</span>
            <span class="text-gray-500 dark:text-gray-400 ml-2">Edad: {{ clienteActual.edad ? clienteActual.edad + ' años' : 'N/A' }} | Motivo: {{ clienteActual.motivo_consulta || 'Sin motivo' }}</span>
          </div>
          <router-link :to="`/expedientes/${clienteActual.id}`" class="text-brand-600 hover:underline font-semibold">
            Ver Expediente →
          </router-link>
        </div>
      </div>

      <!-- Modo de Trabajo (Pestañas) -->
      <div class="flex border-b border-gray-200 dark:border-gray-800 gap-6">
        <button
          @click="modo = 'sintetizador'"
          :class="[
            'pb-3 text-sm font-bold transition-colors relative',
            modo === 'sintetizador' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          Sintetizador de Notas Clínicas
        </button>
        <button
          @click="modo = 'chat'"
          :class="[
            'pb-3 text-sm font-bold transition-colors relative flex items-center gap-2',
            modo === 'chat' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          <span>Chat Interactivo con Agente IA</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
      </div>

      <!-- MODO 1: SINTETIZADOR DE NOTAS -->
      <div v-if="modo === 'sintetizador'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Izquierda: Dictado -->
        <div class="lg:col-span-6 space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Notas de Consulta / Dictado Libre</h2>

            <textarea
              v-model="textoConsulta"
              rows="9"
              placeholder="Ejemplo: Paciente de 45 años, trabaja de home office pero tiene hipertensión e hipertrofia muscular por durar tanto tiempo sentado, come verduras una vez a la semana y carne todos los días, toma 1 litro de agua al día y tiene cero actividades físicas..."
              class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"
            ></textarea>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <button
                @click="procesarConIA"
                :disabled="procesandoIA || !textoConsulta.trim()"
                class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                <svg v-if="!procesandoIA" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                {{ procesandoIA ? 'Sintetizando con Gemini IA...' : 'Sintetizar Notas con IA' }}
              </button>

              <button
                @click="limpiarCampos"
                class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Limpiar notas
              </button>
            </div>
          </div>
        </div>

        <!-- Derecha: Estructura y Guardado -->
        <div class="lg:col-span-6 space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">Estructura Clínica Generada</h2>
              <span v-if="resultadoIA" class="text-xs text-brand-600 dark:text-brand-400 font-medium">IA Lista</span>
            </div>

            <div v-if="!resultadoIA && !procesandoIA" class="py-12 text-center text-gray-400 dark:text-gray-500 text-xs">
              <svg class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>

            <div v-if="procesandoIA" class="py-12 text-center">
              <div class="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
            </div>

            <div v-if="resultadoIA && !procesandoIA" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Diagnóstico Nutricional</label>
                <textarea v-model="formResultado.diagnostico" rows="2" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"></textarea>
              </div>

              <div>
                <label class="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Objetivo Nutricional</label>
                <textarea v-model="formResultado.objetivo_nutricional" rows="2" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"></textarea>
              </div>

              <div>
                <label class="block font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Notas Médicas y Observaciones</label>
                <textarea v-model="formResultado.notas_medicas" rows="3" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"></textarea>
              </div>

              <div v-if="resultadoIA.recomendaciones && resultadoIA.recomendaciones.length > 0" class="p-3 bg-brand-50/50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 space-y-1">
                <p class="font-bold text-brand-700 dark:text-brand-300 uppercase text-[10px]">Recomendaciones Sugeridas por la IA</p>
                <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li v-for="(rec, idx) in resultadoIA.recomendaciones" :key="idx">{{ rec }}</li>
                </ul>
              </div>

              <div class="pt-2">
                <button
                  @click="guardarEnExpediente"
                  :disabled="guardando || !clienteSeleccionadoId"
                  class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                  {{ guardando ? 'Guardando en Expediente...' : 'Guardar Notas en el Expediente' }}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- MODO 2: CHAT INTERACTIVO CON EL AGENTE IA -->
      <div v-if="modo === 'chat'" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div class="h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3 custom-scrollbar">
          <div v-for="(msg, i) in mensajesChat" :key="i" :class="['flex', msg.rol === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="[
              'max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed',
              msg.rol === 'user' ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-xs rounded-bl-none'
            ]">
              <p class="font-bold text-[10px] uppercase mb-1 opacity-75">{{ msg.rol === 'user' ? 'Tú (Doctora)' : 'NutriKer IA' }}</p>
              <p class="whitespace-pre-wrap">{{ msg.texto }}</p>
            </div>
          </div>
          <div v-if="enviandoChat" class="flex justify-start">
            <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl text-xs text-gray-400 flex items-center gap-2">
              <span class="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
              <span>Gemini Flash escribiendo...</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="enviarMensajeChat" class="flex gap-3">
          <input
            v-model="inputChat"
            type="text"
            placeholder="Pregunta a la IA sobre dietas, sustituciones o dudas clínicas..."
            class="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
          <button
            type="submit"
            :disabled="enviandoChat || !inputChat.trim()"
            class="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { clientesApi, expedientesApi, iaApi } from '@/api/index.js'

const router = useRouter()
const route = useRoute()

const modo = ref<'sintetizador' | 'chat'>('sintetizador')

const clientes = ref<any[]>([])
const clienteSeleccionadoId = ref<string>('')
const clienteActual = ref<any>(null)

const textoConsulta = ref('')
const procesandoIA = ref(false)
const guardando = ref(false)

const resultadoIA = ref<any>(null)
const formResultado = ref({
  diagnostico: '',
  objetivo_nutricional: '',
  notas_medicas: ''
})

// Chat Interactivo
const inputChat = ref('')
const enviandoChat = ref(false)
const mensajesChat = ref<Array<{ rol: 'user' | 'assistant', texto: string }>>([
  { rol: 'assistant', texto: 'Hola Dra. ¿En qué puedo asistirte durante esta consulta médica?' }
])

async function cargarClientes() {
  try {
    const data = await clientesApi.getAll()
    clientes.value = data || []
    
    const idParam = (route.query.clienteId as string) || (route.params.clienteId as string)
    if (idParam) {
      clienteSeleccionadoId.value = idParam
      alCambiarCliente()
    }
  } catch (err) {
    console.error('Error al cargar clientes:', err)
  }
}

function alCambiarCliente() {
  const c = clientes.value.find(item => item.id === clienteSeleccionadoId.value)
  clienteActual.value = c || null
}

async function procesarConIA() {
  if (!textoConsulta.value.trim()) return
  procesandoIA.value = true
  resultadoIA.value = null

  try {
    const res = await iaApi.sintetizarNotas({
      textoConsulta: textoConsulta.value,
      clienteId: clienteSeleccionadoId.value || undefined
    })

    resultadoIA.value = res
    formResultado.value = {
      diagnostico: res.diagnostico || '',
      objetivo_nutricional: res.objetivo_nutricional || '',
      notas_medicas: res.notas_medicas || ''
    }
  } catch (err: any) {
    console.error('Error procesando IA:', err)
    alert(err.message || 'Error al procesar las notas con IA')
  } finally {
    procesandoIA.value = false
  }
}

async function enviarMensajeChat() {
  if (!inputChat.value.trim()) return
  const msgUser = inputChat.value.trim()
  inputChat.value = ''
  
  mensajesChat.value.push({ rol: 'user', texto: msgUser })
  enviandoChat.value = true

  try {
    const res = await iaApi.chatAsistente({
      mensaje: msgUser,
      historial: mensajesChat.value,
      clienteId: clienteSeleccionadoId.value || undefined
    })

    mensajesChat.value.push({
      rol: 'assistant',
      texto: res.respuesta || 'Respuesta del asistente.'
    })
  } catch (err: any) {
    console.error('Error en chat de IA:', err)
    mensajesChat.value.push({
      rol: 'assistant',
      texto: 'No fue posible consultar al asistente en este momento.'
    })
  } finally {
    enviandoChat.value = false
  }
}

function limpiarCampos() {
  textoConsulta.value = ''
  resultadoIA.value = null
  formResultado.value = { diagnostico: '', objetivo_nutricional: '', notas_medicas: '' }
}

async function guardarEnExpediente() {
  if (!clienteSeleccionadoId.value) {
    alert('Por favor selecciona un paciente antes de guardar.')
    return
  }

  guardando.value = true
  try {
    await expedientesApi.updateNotas(clienteSeleccionadoId.value, {
      diagnostico: formResultado.value.diagnostico,
      objetivoNutricional: formResultado.value.objetivo_nutricional,
      notasMedicas: formResultado.value.notas_medicas
    })

    alert('Notas clínicas guardadas exitosamente en el expediente del paciente.')
    router.push(`/expedientes/${clienteSeleccionadoId.value}`)
  } catch (err: any) {
    console.error('Error al guardar expediente:', err)
    alert(err.message || 'Error al guardar notas en el expediente')
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarClientes()
})
</script>
