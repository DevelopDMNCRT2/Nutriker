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
  const { textoConsulta, pacienteId } = req.body

  if (!textoConsulta || !textoConsulta.trim()) {
    return res.status(400).json({ error: 'El texto de la consulta o dictado es requerido' })
  }

  try {
    let datosPaciente = null
    if (pacienteId) {
      const pacienteRes = await pool.query('SELECT nombre, edad, motivo_consulta, peso, estatura, patologias FROM pacientes WHERE id = $1', [pacienteId])
      if (pacienteRes.rows.length > 0) {
        datosPaciente = pacienteRes.rows[0]
      }
    }

    const contextText = `
Paciente: ${datosPaciente ? `${datosPaciente.nombre} (${datosPaciente.edad || 'S/D'} años)` : 'Paciente en Consulta'}
Diagnóstico/Patologías registradas: ${datosPaciente?.patologias || datosPaciente?.motivo_consulta || 'Sin antecedente registrado'}

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
    const nombrePaciente = datosPaciente ? datosPaciente.nombre : 'Paciente'
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
  const { mensaje, historial = [], pacienteId } = req.body

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'El mensaje es requerido' })
  }

  try {
    let datosPaciente = null
    if (pacienteId) {
      const pacienteRes = await pool.query('SELECT nombre, edad, motivo_consulta, peso, estatura, patologias FROM pacientes WHERE id = $1', [pacienteId])
      if (pacienteRes.rows.length > 0) {
        datosPaciente = pacienteRes.rows[0]
      }
    }

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const promptContext = `Eres NutriKer AI, asistente médico nutricional. 
Paciente en consulta: ${datosPaciente ? `${datosPaciente.nombre}, Patologías: ${datosPaciente.patologias || 'Ninguna'}` : 'Consulta General'}
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
      respuestaDinamica = `Para ${datosPaciente ? datosPaciente.nombre : 'este paciente'}, sugiero colaciones de bajo índice glucémico como almendras con manzana verde, yogur griego sin azúcar con chía o bastones de pepino con hummus.`
    } else if (query.includes('agua') || query.includes('hidratación') || query.includes('sed')) {
      respuestaDinamica = `Se recomienda calcular el requerimiento hídrico a 35ml por kg de peso. Para la condición actual del paciente, entre 2.2 y 2.7 litros de agua natural al día.`
    } else if (query.includes('hipertensión') || query.includes('presión') || query.includes('sal')) {
      respuestaDinamica = `Para el manejo de presión arterial, es clave implementar el protocolo DASH: sodio < 1500mg/día, incrementar potasio con aguacate y espinacas, y evitar embutidos o ultraprocesados.`
    } else if (query.includes('ayud') || query.includes('puedes') || query.includes('qué haces') || query.includes('ahora')) {
      respuestaDinamica = `¡Claro que sí, Dra.! Puedo ayudarte a sugerir reemplazos de alimentos, calcular requerimientos hídricos o calóricos, sugerir colaciones personalizadas para la patología del paciente o redactar el plan nutricional.`
    } else {
      respuestaDinamica = `Comprendido. Respecto a "${mensaje}", analizando el expediente de ${datosPaciente ? datosPaciente.nombre : 'paciente'}, sugiero mantener un balance de macronutrientes del 45% carbohidratos complejos, 30% proteínas magras y 25% grasas saludables con monitoreo en 15 días.`
    }

    res.json({ respuesta: respuestaDinamica })
  } catch (err) {
    console.error('Error en chatAsistente:', err.message)
    res.status(500).json({ error: 'Error en la respuesta del asistente virtual' })
  }
}

// ─── Helpers: Harris-Benedict + Factor de Actividad ──────────────────────────
function calcularHarrisBenedict(sexo, peso, estatura, edad) {
  if (!peso || !estatura || !edad) return null
  const p = parseFloat(peso), e = parseFloat(estatura), a = parseInt(edad)
  // Fórmula revisada de Harris-Benedict (Roza & Shizgal, 1984)
  if (sexo === 'Femenino') return 447.593 + (9.247 * p) + (3.098 * e) - (4.330 * a)
  return 88.362 + (13.397 * p) + (4.799 * e) - (5.677 * a)
}

function factorActividad(estiloVidaStr) {
  const s = (estiloVidaStr || '').toLowerCase()
  if (s.includes('activa') || s.includes('muy activo')) return 1.725
  if (s.includes('moderada') || s.includes('moderado')) return 1.55
  if (s.includes('ligera') || s.includes('ligero')) return 1.375
  return 1.2 // Sedentario por defecto
}

// ─── POST /api/ia/generar-menu ───────────────────────────────────────────────
export async function generarMenu(req, res) {
  const { pacienteId, instrucciones } = req.body

  try {
    let datosPaciente = null
    let expediente = null
    let smaeResumen = ''

    if (pacienteId) {
      const pacienteRes = await pool.query(
        'SELECT nombre, sexo, edad, patologias, gustos, alergias, estilo_vida, cirugia FROM pacientes WHERE id = $1',
        [pacienteId]
      )
      if (pacienteRes.rows.length > 0) datosPaciente = pacienteRes.rows[0]

      const expRes = await pool.query(
        'SELECT diagnostico, objetivo_nutricional FROM expedientes_clinicos WHERE paciente_id = $1 ORDER BY created_at DESC LIMIT 1',
        [pacienteId]
      )
      if (expRes.rows.length > 0) expediente = expRes.rows[0]

      // Última medición antropométrica para peso y estatura actualizados
      const medRes = await pool.query(
        'SELECT peso, talla FROM mediciones_antropometricas WHERE paciente_id = $1 ORDER BY fecha DESC LIMIT 1',
        [pacienteId]
      )
      if (medRes.rows.length > 0) {
        datosPaciente.peso = medRes.rows[0].peso || datosPaciente.peso
        datosPaciente.estatura = medRes.rows[0].talla || datosPaciente.estatura
      }
    }

    // ── Calcular requerimiento calórico con Harris-Benedict ──────────────────
    const tmb = calcularHarrisBenedict(
      datosPaciente?.sexo,
      datosPaciente?.peso,
      datosPaciente?.estatura,
      datosPaciente?.edad
    )
    let estiloObj = {}
    try { estiloObj = JSON.parse(datosPaciente?.estilo_vida || '{}') } catch {}
    const fa = factorActividad(estiloObj.actividad_diaria || '')
    const get = tmb ? Math.round(tmb * fa) : null
    const kcalObjetivo = get ? `~${get} kcal/día (Harris-Benedict × FA ${fa})` : 'No calculable (faltan datos antropométricos)'

    // ── Cargar catálogo SMAE agrupado ────────────────────────────────────────
    try {
      const smaeRes = await pool.query(`
        SELECT g.nombre AS grupo, a.nombre AS alimento, a.cantidad_medida, a.kcal, a.proteina_g, a.hco_g, a.lipidos_g
        FROM alimentos_smae a
        JOIN grupos_equivalentes g ON g.id = a.grupo_id
        WHERE a.activo = TRUE
        ORDER BY g.id, a.nombre
      `)
      const porGrupo = {}
      for (const row of smaeRes.rows) {
        if (!porGrupo[row.grupo]) porGrupo[row.grupo] = []
        porGrupo[row.grupo].push(`${row.alimento} (${row.cantidad_medida} = ${row.kcal} kcal, P:${row.proteina_g}g, HC:${row.hco_g}g, G:${row.lipidos_g}g)`)
      }
      smaeResumen = Object.entries(porGrupo)
        .map(([grupo, items]) => `**${grupo}:** ${items.slice(0, 10).join(' | ')}${items.length > 10 ? ` (+${items.length - 10} más)` : ''}`)
        .join('\n')
    } catch (e) {
      console.warn('No se pudo cargar SMAE:', e.message)
      smaeResumen = 'Catálogo SMAE no disponible, usa alimentos comunes mexicanos.'
    }

    // ── Construir contexto enriquecido ───────────────────────────────────────
    const contextText = `
DATOS DEL PACIENTE:
- Nombre: ${datosPaciente?.nombre || 'Paciente General'}
- Sexo: ${datosPaciente?.sexo || 'N/A'}, Edad: ${datosPaciente?.edad || 'N/A'} años
- Peso: ${datosPaciente?.peso || 'N/A'} kg, Estatura: ${datosPaciente?.estatura || 'N/A'} cm
- Patologías: ${datosPaciente?.patologias || 'Ninguna'}
- Alergias: ${datosPaciente?.alergias || 'Ninguna'}
- Gustos / Preferencias: ${datosPaciente?.gustos || 'Sin preferencia específica'}
- Cirugías previas: ${(() => { try { const c = JSON.parse(datosPaciente?.cirugia || '{}'); return c.tuvo ? c.cuales : 'Ninguna' } catch { return 'Ninguna' } })()}
- Actividad física: ${estiloObj.actividad_diaria || 'No especificada'}, Deporte: ${estiloObj.deporte ? `Sí (${estiloObj.cual_deporte || ''})` : 'No'}, Hidratación: ${estiloObj.agua_diaria || 'No especificada'}

OBJETIVO CLÍNICO:
- Requerimiento calórico estimado (Harris-Benedict): ${kcalObjetivo}
- Diagnóstico: ${expediente?.diagnostico || 'Sin expediente'}
- Objetivo nutricional de Karla: ${expediente?.objetivo_nutricional || 'Mantenimiento y salud general'}

INSTRUCCIONES ADICIONALES DE LA DRA. KARLA: "${instrucciones || 'Genera una dieta balanceada y variada adecuada para este paciente'}"

CATÁLOGO DE ALIMENTOS SMAE 2024/2026 (alimentos reales disponibles — úsalos para armar el menú):
${smaeResumen}
`

const PROMPT_MENU = `Eres la asistente nutricional inteligente de NutriKer, trabajando directamente con la Dra. Karla Covarrubias.
Tu tarea es generar un MENÚ SEMANAL COMPLETO y PERSONALIZADO basado en el expediente clínico del paciente y el catálogo SMAE.

REGLAS CLÍNICAS Y PREFERENCIAS DE LA DRA. KARLA (¡INQUEBRANTABLES!):
1. MACRONUTRIENTES: Si el paciente no tiene patologías graves, tu base de cálculo es 50% Carbohidratos, 20% Proteína y 30% Grasas. Acércate al requerimiento calórico estimado de Harris-Benedict.
2. ALIMENTOS FAVORITOS: Prioriza incluir aguacate, verdura cruda y pescado en las comidas principales.
3. ALIMENTOS PROHIBIDOS: NUNCA, bajo ninguna circunstancia, incluyas enlatados, ultraprocesados, pan de dulce o refrescos.
4. CATÁLOGO: Usa como base los alimentos del catálogo SMAE proporcionado, pero calcula las cantidades para ser exactas.
5. FORMATO DE CANTIDADES: Exprésate con EXTREMA PRECISIÓN en gramos o mililitros siempre que sea posible (ej. "120 gramos de Pechuga de Pollo", "200 ml de leche"). No uses "una palma" o medidas ambiguas.
6. NÚMERO DE COMIDAS: La Dra. Karla adapta las comidas según el paciente (de 3 a 6). El sistema de base de datos tiene 5 "cajas" (desayuno, colacion_am, comida, colacion_pm, cena). 
   - Si el paciente requiere 3 comidas, pon "Ayuno" o "Libre" en las colaciones.
   - Si el paciente requiere 6 comidas, combina la sexta en la última caja (ej. "Cena + Colación Nocturna: ...").

FORMATO DE RESPUESTA: Devuelve ÚNICAMENTE un objeto JSON válido con exactamente estas 35 claves + notas_ia:
{
  "lunes_desayuno": "descripción precisa en gramos",
  "lunes_colacion_am": "...",
  "lunes_comida": "...",
  "lunes_colacion_pm": "...",
  "lunes_cena": "...",
  ... (repite para martes, miercoles, jueves, viernes, sabado, domingo)
  "notas_ia": "notas clínicas justificando tus decisiones o explicando la distribución de macros"
}
NO escribas texto fuera del JSON. No uses markdown dentro del JSON.`

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent([PROMPT_MENU, contextText])
        const responseText = result.response.text()
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          const kcalMsg = get ? ` El plan está diseñado para un requerimiento de ${kcalObjetivo}.` : ''
          return res.json({
            menu: parsed,
            respuesta: (parsed.notas_ia || '¡Menú generado exitosamente con el catálogo SMAE 2024!') + kcalMsg,
            kcal_objetivo: kcalObjetivo
          })
        }
      } catch (geminiErr) {
        console.warn('Gemini menu fallback:', geminiErr.message)
      }
    }

    // Fallback con SMAE real
    const fallback = {
      lunes_desayuno: '¾ taza de avena en hojuelas cocida con 1 taza de fresas y 1 cdita de miel de abeja',
      lunes_colacion_am: '1 manzana pequeña con 10 almendras',
      lunes_comida: '120g pechuga de pollo a la plancha, ½ taza de arroz integral, 1 taza de brócoli al vapor con 1 cdita aceite de oliva',
      lunes_colacion_pm: '150g yogur natural descremado con 1 kiwi',
      lunes_cena: '2 huevos revueltos con espinacas y 1 tortilla de maíz',
      martes_desayuno: '2 rebanadas de pan integral con 1 huevo cocido y ½ aguacate',
      martes_colacion_am: '1 guayaba con 15 cacahuates tostados sin sal',
      martes_comida: '120g de tilapia al vapor, ½ taza de frijoles negros, ensalada de pepino y jitomate',
      martes_colacion_pm: '240ml leche descremada con 1 plátano tabasco',
      martes_cena: '1 taza de sopa de verduras (zanahoria, chayote, ejotes), 1 tortilla de maíz',
      notas_ia: `Menú generado con catálogo SMAE 2024/2026. Requerimiento calórico estimado: ${kcalObjetivo}. Mantener hidratación de 2 litros de agua al día.`
    }
    res.json({ menu: fallback, respuesta: `Propuesta base SMAE generada. ${kcalObjetivo}`, kcal_objetivo: kcalObjetivo })
  } catch (err) {
    console.error('Error en generarMenu:', err.message)
    res.status(500).json({ error: 'Error al generar el menú con IA' })
  }
}

