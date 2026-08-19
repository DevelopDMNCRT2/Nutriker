import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as xlsx from 'xlsx'
import mammoth from 'mammoth'

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

const HORARIOS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
]

async function extraerTexto(buffer, mimetype, originalname) {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer)
      return data.text
    } else if (originalname.endsWith('.xlsx') || originalname.endsWith('.xls') || originalname.endsWith('.csv')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      return xlsx.utils.sheet_to_csv(sheet)
    } else if (originalname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } else {
      // Intentar como texto plano fallback
      return buffer.toString('utf8')
    }
  } catch (error) {
    console.error('Error extrayendo texto del documento:', error)
    throw new Error('Formato de archivo no soportado o corrupto.')
  }
}

async function getAgendaOcupada() {
  const { rows } = await pool.query(`
    SELECT TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, horario 
    FROM citas 
    WHERE fecha >= CURRENT_DATE AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
  `)
  const ocupados = {}
  rows.forEach(r => {
    if (!ocupados[r.fecha]) ocupados[r.fecha] = new Set()
    ocupados[r.fecha].add(r.horario)
  })
  return ocupados
}

function obtenerProximoSlotDisponible(ocupados, fechaInicialBase) {
  let dateObj = new Date(fechaInicialBase || Date.now())
  
  // Buscar máximo 30 días adelante
  for (let offset = 0; offset < 30; offset++) {
    // Evitar fines de semana (0 = Domingo, 6 = Sábado)
    const dayOfWeek = dateObj.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dateObj.setDate(dateObj.getDate() + 1)
      continue
    }

    const dateStr = dateObj.toISOString().split('T')[0]
    const ocupadosDia = ocupados[dateStr] || new Set()

    for (let horario of HORARIOS_DISPONIBLES) {
      if (!ocupadosDia.has(horario)) {
        // Reservar en memoria para las siguientes iteraciones
        if (!ocupados[dateStr]) ocupados[dateStr] = new Set()
        ocupados[dateStr].add(horario)
        return { fecha: dateStr, horario }
      }
    }
    dateObj.setDate(dateObj.getDate() + 1)
  }
  
  throw new Error('Agenda llena en los próximos 30 días.')
}

export async function importarCitas(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' })
  }

  if (!genAI) {
    return res.status(500).json({ error: 'La API Key de Gemini no está configurada.' })
  }

  try {
    const texto = await extraerTexto(req.file.buffer, req.file.mimetype, req.file.originalname)
    
    const SYSTEM_PROMPT = `
      Eres el Asistente Clínico de NutriKer. Tu tarea es extraer la lista de pacientes a agendar del documento proporcionado.
      Debes devolver ÚNICAMENTE un Array de objetos JSON válidos, sin texto extra, sin markdown (\`\`\`json).
      Cada objeto debe tener:
      - "nombre": (String) Nombre completo del paciente.
      - "telefono": (String) Opcional, si no viene pon null.
      - "correo": (String) Opcional, si no viene pon null.
      - "fecha": (String) YYYY-MM-DD. Opcional, si no se infiere del texto, pon null.
      - "horario": (String) HH:MM (formato 24h). Opcional, si no se infiere, pon null.
      - "notas": (String) Alguna nota u observación si la hay (ej. "Empresa X"), si no, pon null.

      Documento:
      ${texto}
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(SYSTEM_PROMPT)
    let responseText = result.response.text().trim()
    
    // Limpiar posible formato markdown
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '')
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '')
    }

    let pacientes = []
    try {
      pacientes = JSON.parse(responseText)
      if (!Array.isArray(pacientes)) {
        if (pacientes.pacientes) pacientes = pacientes.pacientes
        else pacientes = [pacientes]
      }
    } catch (parseError) {
      console.error('Gemini retornó un JSON inválido:', responseText)
      return res.status(500).json({ error: 'La IA no pudo estructurar correctamente los datos.' })
    }

    if (pacientes.length === 0) {
      return res.status(400).json({ error: 'No se encontraron pacientes para agendar en el documento.' })
    }

    const agendaOcupada = await getAgendaOcupada()
    const citasInsertadas = []

    for (let pac of pacientes) {
      let finalFecha = pac.fecha
      let finalHorario = pac.horario

      if (finalFecha && finalHorario) {
        // Verificar disponibilidad
        const ocupadosDia = agendaOcupada[finalFecha] || new Set()
        if (ocupadosDia.has(finalHorario)) {
          // El horario explícito está ocupado, auto-agendar próximo
          const slot = obtenerProximoSlotDisponible(agendaOcupada, finalFecha)
          finalFecha = slot.fecha
          finalHorario = slot.horario
        } else {
          // Reservar en memoria
          if (!agendaOcupada[finalFecha]) agendaOcupada[finalFecha] = new Set()
          agendaOcupada[finalFecha].add(finalHorario)
        }
      } else {
        // Auto-agendar próximo
        const slot = obtenerProximoSlotDisponible(agendaOcupada, pac.fecha || undefined)
        finalFecha = slot.fecha
        finalHorario = slot.horario
      }

      const id = await generarIdUnico('citas')
      const clienteNombre = pac.nombre || 'Paciente Desconocido'
      const clienteTelefono = pac.telefono || 'Sin especificar'
      const correo = pac.correo || ''
      const notas = pac.notas || 'Importado vía IA'

      await pool.query(
        `INSERT INTO citas (id, cliente_nombre, cliente_telefono, correo, fecha, horario, notas, atencion_previa, estado, servicio, tipo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, clienteNombre, clienteTelefono, correo, finalFecha, finalHorario, notas, 'no', 'Confirmada', 'Consulta Nutricional', 'Presencial']
      )

      citasInsertadas.push({
        nombre: clienteNombre,
        fecha: finalFecha,
        horario: finalHorario
      })
    }

    res.status(200).json({
      message: `Se importaron ${citasInsertadas.length} citas exitosamente.`,
      citas: citasInsertadas
    })

  } catch (error) {
    console.error('Error en importarCitas:', error)
    res.status(500).json({ error: 'Ocurrió un error al procesar el archivo.', detalle: error.message })
  }
}
