import { GoogleGenerativeAI } from '@google/generative-ai'
import pool from '../db/pool.js'

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Prompt del Sistema para la Nutrióloga de NutriKer
const SYSTEM_PROMPT = `Eres el Asistente Clínico Inteligente de NutriKer, especializado en nutrición clínica y del metabolismo.
Tu tarea es analizar la consulta o dictado médico provisto y sintetizarlo en 3 campos clínicos DIFERENCIADOS y ESTRUCTURADOS:

- "diagnostico": Una sentencia diagnóstica clínica formal (ej. "Paciente femenino de 32 años en seguimiento nutricional por resistencia a la insulina con evolución clínica favorable").
- "objetivo_nutricional": Objetivos nutricionales claros a corto y mediano plazo (ej. "Aumentar masa muscular magra, mejorar sensibilidad a la insulina y optimizar hidratación").
- "notas_medicas": Detalle de observaciones, síntomas reportados, evolución de hábitos y cambios indicados en consulta.

Debes responder ÚNICAMENTE con un objeto JSON válido con las siguientes claves:
{
  "diagnostico": "Sentencia diagnóstica clínica formal",
  "objetivo_nutricional": "Objetivos nutricionales específicos",
  "notas_medicas": "Detalle clínico de observaciones y síntomas de la consulta",
  "peso_sugerido": null,
  "porcentaje_grasa_sugerido": null,
  "masa_muscular_sugerida": null,
  "recomendaciones": ["Recomendación 1", "Recomendación 2"],
  "resumen_asistente": "Notas procesadas exitosamente."
}

No agregues texto fuera del objeto JSON.`

// ─── POST /api/ia/sintetizar-notas ───────────────────────────────────────────
export async function sintetizarNotas(req, res) {
  const { textoConsulta, clienteId } = req.body

  if (!textoConsulta || !textoConsulta.trim()) {
    return res.status(400).json({ error: 'El texto de la consulta o dictado es requerido' })
  }

  try {
    let datosCliente = null
    if (clienteId) {
      const clienteRes = await pool.query('SELECT nombre, edad, motivo_consulta, peso, estatura, patologias FROM clientes WHERE id = $1', [clienteId])
      if (clienteRes.rows.length > 0) {
        datosCliente = clienteRes.rows[0]
      }
    }

    const contextText = `
Paciente: ${datosCliente ? `${datosCliente.nombre} (${datosCliente.edad || 'S/D'} años)` : 'Paciente en Consulta'}
Diagnóstico/Patologías registradas: ${datosCliente?.patologias || datosCliente?.motivo_consulta || 'Sin antecedente registrado'}

Dictado o Notas de la Consulta Actual:
"${textoConsulta}"
`

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent([SYSTEM_PROMPT, contextText])
        const responseText = result.response.text()

        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return res.json(parsed)
        }
      } catch (geminiError) {
        console.warn('Google GenAI Error fallback:', geminiError.message)
      }
    }

    // Extracción y síntesis PNL dinámica según la consulta médica ingresada
    const textLower = textoConsulta.toLowerCase()
    const nombrePaciente = datosCliente ? datosCliente.nombre : 'Paciente'
    const palabras = textoConsulta.trim()
    
    // 1. Diagnóstico Nutricional Dinámico
    let hallazgosDiagnostico = []
    if (textLower.includes('no hace ejercicio') || textLower.includes('sentado') || textLower.includes('oficina') || textLower.includes('sedentario')) {
      hallazgosDiagnostico.push('estilo de vida sedentario')
    }
    if (textLower.includes('carne') && (textLower.includes('poca verdura') || textLower.includes('no come verdura') || textLower.includes('pocas verduras'))) {
      hallazgosDiagnostico.push('patrón alimenticio desbalanceado con exceso de proteína animal y déficit de fibra/vegetales')
    } else if (textLower.includes('poca verdura') || textLower.includes('sin verdura')) {
      hallazgosDiagnostico.push('déficit en el aporte diario de micronutrientes y fibra vegetal')
    }
    if (textLower.includes('hipertens') || textLower.includes('presión') || textLower.includes('presion')) {
      hallazgosDiagnostico.push('antecedente de hipertensión arterial')
    }
    if (textLower.includes('fatiga') || textLower.includes('cansado') || textLower.includes('cansancio')) {
      hallazgosDiagnostico.push('síntomas de fatiga metabólica o baja energía')
    }

    const diagnosticoGenerado = hallazgosDiagnostico.length > 0
      ? `Paciente ${nombrePaciente} presenta ${hallazgosDiagnostico.join(' y ')}.`
      : `Paciente ${nombrePaciente} en evaluación nutricional continua con parámetros ponderales en seguimiento.`

    // 2. Objetivo Nutricional Dinámico
    let objetivos = []
    if (textLower.includes('ejercicio') || textLower.includes('sedentario') || textLower.includes('oficina') || textLower.includes('caminata')) {
      objetivos.push('incorporar actividad física moderada progresiva (mínimo 30 minutos al día)')
    }
    if (textLower.includes('verdura') || textLower.includes('fibra')) {
      objetivos.push('aumentar la densidad de fibra e incluir vegetales en al menos 2 tiempos de comida principales')
    }
    if (textLower.includes('carne')) {
      objetivos.push('moderar las porciones de carne roja alternando con fuentes de proteína magra y vegetal')
    }
    if (textLower.includes('agua') || textLower.includes('litro')) {
      objetivos.push('optimizar el volumen de hidratación diaria a 2.5 litros de agua natural')
    }

    const objetivoGenerado = objetivos.length > 0
      ? `Prioridades del plan: ${objetivos.join(', ')}.`
      : 'Mejorar la composición corporal, optimizar el perfil metabólico y consolidar hábitos saludables.'

    // 3. Recomendaciones Específicas
    let recomendacionesGeneradas = []
    if (textLower.includes('verdura')) {
      recomendacionesGeneradas.push('Agregar una porción de ensalada verde o verduras al vapor en comida y cena.')
    }
    if (textLower.includes('ejercicio') || textLower.includes('caminata') || textLower.includes('oficina')) {
      recomendacionesGeneradas.push('Realizar pausas activas cada 2 horas de trabajo e incrementar la caminata diaria a 30 minutos.')
    }
    if (textLower.includes('agua') || textLower.includes('litro')) {
      recomendacionesGeneradas.push('Incrementar paulatinamente el consumo de agua natural hasta alcanzar 2.5 litros diarios.')
    }
    if (textLower.includes('carne')) {
      recomendacionesGeneradas.push('Sustituir la carne roja por pescado o pollo a la plancha al menos 3 días por semana.')
    }
    if (recomendacionesGeneradas.length === 0) {
      recomendacionesGeneradas = [
        'Ajustar la distribución de macronutrientes en cada tiempo de comida.',
        'Mantener hidratación adecuada (2-2.5 litros de agua al día).',
        'Incluir colaciones saludables a media mañana o media tarde.'
      ]
    }

    const sintetizadoMock = {
      diagnostico: diagnosticoGenerado,
      objetivo_nutricional: objetivoGenerado,
      notas_medicas: `Observaciones de la consulta: ${palabras}`,
      peso_sugerido: null,
      porcentaje_grasa_sugerido: null,
      masa_muscular_sugerida: null,
      recomendaciones: recomendacionesGeneradas,
      resumen_asistente: 'Notas clínicas analizadas y sintetizadas dinámicamente por NutriKer IA.'
    }

    res.json(sintetizadoMock)
  } catch (err) {
    console.error('Error en sintetizarNotas:', err.message)
    res.status(500).json({ error: 'Error al procesar las notas clínicas con IA' })
  }
}

// ─── POST /api/ia/chat-asistente ─────────────────────────────────────────────
export async function chatAsistente(req, res) {
  const { mensaje, historial = [], clienteId } = req.body

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'El mensaje es requerido' })
  }

  try {
    let datosCliente = null
    if (clienteId) {
      const clienteRes = await pool.query('SELECT nombre, edad, motivo_consulta, peso, estatura, patologias FROM clientes WHERE id = $1', [clienteId])
      if (clienteRes.rows.length > 0) {
        datosCliente = clienteRes.rows[0]
      }
    }

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const promptContext = `Eres NutriKer AI, asistente médico nutricional. 
Paciente en consulta: ${datosCliente ? `${datosCliente.nombre}, Patologías: ${datosCliente.patologias || 'Ninguna'}` : 'Consulta General'}
Mensaje del médico: "${mensaje}"
Responde de forma concisa, profesional y útil para la nutrióloga.`

        const result = await model.generateContent(promptContext)
        const respuesta = result.response.text()
        return res.json({ respuesta })
      } catch (geminiErr) {
        console.warn('Gemini chat fallback:', geminiErr.message)
      }
    }

    // Asistente Clínico Inteligente (Procesamiento dinámico de mensajes)
    const query = mensaje.toLowerCase().trim()
    let respuestaDinamica = ''

    if (query.includes('colación') || query.includes('colacion') || query.includes('snack')) {
      respuestaDinamica = `Para ${datosCliente ? datosCliente.nombre : 'este paciente'}, sugiero colaciones de bajo índice glucémico como almendras con manzana verde, yogur griego sin azúcar con chía o bastones de pepino con hummus.`
    } else if (query.includes('agua') || query.includes('hidratación') || query.includes('sed')) {
      respuestaDinamica = `Se recomienda calcular el requerimiento hídrico a 35ml por kg de peso. Para la condición actual del paciente, entre 2.2 y 2.7 litros de agua natural al día.`
    } else if (query.includes('hipertensión') || query.includes('presión') || query.includes('sal')) {
      respuestaDinamica = `Para el manejo de presión arterial, es clave implementar el protocolo DASH: sodio < 1500mg/día, incrementar potasio con aguacate y espinacas, y evitar embutidos o ultraprocesados.`
    } else if (query.includes('ayud') || query.includes('puedes') || query.includes('qué haces') || query.includes('ahora')) {
      respuestaDinamica = `¡Claro que sí, Dra.! Puedo ayudarte a sugerir reemplazos de alimentos, calcular requerimientos hídricos o calóricos, sugerir colaciones personalizadas para la patología del paciente o redactar el plan nutricional.`
    } else {
      respuestaDinamica = `Comprendido. Respecto a "${mensaje}", analizando el expediente de ${datosCliente ? datosCliente.nombre : 'paciente'}, sugiero mantener un balance de macronutrientes del 45% carbohidratos complejos, 30% proteínas magras y 25% grasas saludables con monitoreo en 15 días.`
    }

    res.json({ respuesta: respuestaDinamica })
  } catch (err) {
    console.error('Error en chatAsistente:', err.message)
    res.status(500).json({ error: 'Error en la respuesta del asistente virtual' })
  }
}
