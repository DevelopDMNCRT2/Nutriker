import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

/**
 * Controlador de Citas Médicas y Prevención de Traslapes de Horarios
 */

// Horarios disponibles de la clínica NutriKer (Bloques de 40 mins, 8:40 AM a 5:20 PM con receso)
const HORARIOS_DISPONIBLES = [
  '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', '13:20', '14:00',
  '15:20', '16:00', '16:40'
]

// ─── GET /api/citas ────────────────────────────────────────────────────────
export const getCitas = async (req, res) => {
  try {
    const query = `
      SELECT id, 
             COALESCE(cliente_nombre, '') AS "cliente_nombre",
             COALESCE(cliente_nombre, '') AS "nombre",
             COALESCE(cliente_telefono, '') AS "cliente_telefono",
             COALESCE(cliente_telefono, '') AS "telefono",
             COALESCE(correo, '') AS "correo",
             TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha",
             horario,
             COALESCE(atencion_previa, 'no') AS "atencion_previa",
             COALESCE(estado, 'Confirmada') AS "estado",
             COALESCE(servicio, 'Consulta Nutricional') AS "servicio",
             COALESCE(tipo, 'Presencial') AS "tipo",
             notas,
             created_at,
             updated_at
      FROM citas 
      WHERE deleted_at IS NULL 
      ORDER BY fecha ASC, horario ASC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error('getCitas error:', error.message)
    res.status(500).json({ error: 'Error al obtener citas', detalle: error.message })
  }
}

// ─── GET /api/citas/:id ────────────────────────────────────────────────────
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT id, 
             COALESCE(cliente_nombre, '') AS "cliente_nombre",
             COALESCE(cliente_nombre, '') AS "nombre",
             COALESCE(cliente_telefono, '') AS "cliente_telefono",
             COALESCE(cliente_telefono, '') AS "telefono",
             COALESCE(correo, '') AS "correo",
             TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha",
             horario,
             COALESCE(atencion_previa, 'no') AS "atencion_previa",
             COALESCE(estado, 'Confirmada') AS "estado",
             COALESCE(servicio, 'Consulta Nutricional') AS "servicio",
             COALESCE(tipo, 'Presencial') AS "tipo",
             notas,
             created_at,
             updated_at
      FROM citas 
      WHERE id = $1 AND deleted_at IS NULL
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('getCitaById error:', error.message)
    res.status(500).json({ error: 'Error al obtener la cita', detalle: error.message })
  }
}

// ─── GET /api/citas/horarios-ocupados ──────────────────────────────────────
export const getHorariosOcupados = async (req, res) => {
  try {
    const { fecha } = req.query
    if (!fecha) {
      return res.status(400).json({ error: 'Se requiere el parámetro fecha (YYYY-MM-DD)' })
    }
    const query = `
      SELECT horario FROM citas 
      WHERE fecha = $1 AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
    `
    const { rows } = await pool.query(query, [fecha])
    const ocupados = rows.map(r => r.horario)
    res.json({ ocupados, disponibles: HORARIOS_DISPONIBLES.filter(h => !ocupados.includes(h)) })
  } catch (error) {
    console.error('getHorariosOcupados error:', error.message)
    res.status(500).json({ error: 'Error al obtener horarios ocupados', detalle: error.message })
  }
}

// ─── POST /api/citas ───────────────────────────────────────────────────────
export const createCita = async (req, res) => {
  try {
    const { nombre, cliente_nombre, correo, cliente_correo, telefono, cliente_telefono, fecha, horario, notas, servicio, tipo, atencion_previa, peso, estatura } = req.body

    const patientName = cliente_nombre || nombre
    const patientPhone = cliente_telefono || telefono
    const patientEmail = cliente_correo || correo || ''

    if (!patientName || !patientPhone || !fecha || !horario) {
      return res.status(400).json({
        error: 'Nombre del paciente, teléfono, fecha y horario son obligatorios'
      })
    }

    // Verificar traslape en el mismo horario y fecha
    const conflictoQuery = `
      SELECT id FROM citas 
      WHERE fecha = $1 AND horario = $2 AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
    `
    const conflicto = await pool.query(conflictoQuery, [fecha, horario])
    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        error: `El horario ${horario} ya está reservado para la fecha ${fecha}. Elige otro horario.`
      })
    }

    const newId = await generarIdUnico('citas')
    const insertQuery = `
      INSERT INTO citas (id, cliente_nombre, cliente_telefono, correo, fecha, horario, atencion_previa, peso, estatura, notas, servicio, tipo, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Confirmada')
      RETURNING *, cliente_nombre AS "nombre", cliente_telefono AS "telefono", TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha"
    `
    const { rows } = await pool.query(insertQuery, [
      newId, patientName, patientPhone, patientEmail, fecha, horario,
      atencion_previa || 'no',
      peso ? parseFloat(peso) : null,
      estatura ? parseFloat(estatura) : null,
      notas || null,
      servicio || 'Consulta Nutricional',
      tipo || (atencion_previa === 'si' ? 'Subsecuente' : 'Primera Vez')
    ])

    res.status(201).json(rows[0])
  } catch (error) {
    console.error('createCita error:', error.message)
    res.status(500).json({ error: 'Error al registrar la cita', detalle: error.message })
  }
}

// ─── PUT /api/citas/:id ────────────────────────────────────────────────────
export const updateCita = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, cliente_nombre, correo, cliente_correo, telefono, cliente_telefono, fecha, horario, estado, notas, servicio, tipo, atencion_previa } = req.body

    const existing = await pool.query('SELECT * FROM citas WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    if (fecha && horario) {
      const conflictoQuery = `
        SELECT id FROM citas 
        WHERE fecha = $1 AND horario = $2 AND id != $3 AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
      `
      const conflicto = await pool.query(conflictoQuery, [fecha, horario, id])
      if (conflicto.rows.length > 0) {
        return res.status(409).json({
          error: `El horario ${horario} ya está reservado para la fecha ${fecha}. Elige otro horario.`
        })
      }
    }

    const current = existing.rows[0]
    const updateQuery = `
      UPDATE citas 
      SET cliente_nombre = $1, cliente_telefono = $2, correo = $3, fecha = $4, horario = $5,
          atencion_previa = $6, estado = $7, notas = $8, servicio = $9, tipo = $10, updated_at = NOW()
      WHERE id = $11 AND deleted_at IS NULL
      RETURNING *, cliente_nombre AS "nombre", cliente_telefono AS "telefono", TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha"
    `
    const { rows } = await pool.query(updateQuery, [
      cliente_nombre || nombre || current.cliente_nombre,
      cliente_telefono || telefono || current.cliente_telefono,
      cliente_correo || correo || current.correo || '',
      fecha || current.fecha,
      horario || current.horario,
      atencion_previa || current.atencion_previa || 'no',
      estado || current.estado || 'Confirmada',
      notas !== undefined ? notas : current.notas,
      servicio || current.servicio || 'Consulta Nutricional',
      tipo || current.tipo || 'Presencial',
      id
    ])

    res.json(rows[0])
  } catch (error) {
    console.error('updateCita error:', error.message)
    res.status(500).json({ error: 'Error al actualizar la cita', detalle: error.message })
  }
}

// ─── DELETE /api/citas/:id (Soft Delete) ───────────────────────────────────
export const deleteCita = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      UPDATE citas 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    res.json({ message: 'Cita eliminada correctamente', id: rows[0].id })
  } catch (error) {
    console.error('deleteCita error:', error.message)
    res.status(500).json({ error: 'Error al eliminar la cita', detalle: error.message })
  }
}
