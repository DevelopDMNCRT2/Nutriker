import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

/**
 * Controlador de Citas Médicas y Prevención de Traslapes de Horarios
 */

// Horarios disponibles de la clínica NutriKer
const HORARIOS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
]

// ─── GET /api/citas ────────────────────────────────────────────────────────
export const getCitas = async (req, res) => {
  try {
    const query = `
      SELECT * FROM citas 
      WHERE deleted_at IS NULL 
      ORDER BY fecha ASC, horario ASC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas', detalle: error.message })
  }
}

// ─── GET /api/citas/:id ────────────────────────────────────────────────────
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT * FROM citas 
      WHERE id = $1 AND deleted_at IS NULL
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }
    res.json(rows[0])
  } catch (error) {
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
      WHERE fecha = $1 AND deleted_at IS NULL AND estado != 'Cancelada'
    `
    const { rows } = await pool.query(query, [fecha])
    const ocupados = rows.map(r => r.horario)
    res.json({ ocupados, disponibles: HORARIOS_DISPONIBLES.filter(h => !ocupados.includes(h)) })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios ocupados', detalle: error.message })
  }
}

// ─── POST /api/citas ───────────────────────────────────────────────────────
export const createCita = async (req, res) => {
  try {
    const { nombre, cliente_nombre, correo, cliente_correo, telefono, cliente_telefono, fecha, horario, notas, servicio, tipo } = req.body

    const patientName = nombre || cliente_nombre
    const patientPhone = telefono || cliente_telefono
    const patientEmail = correo || cliente_correo || ''

    if (!patientName || !patientPhone || !fecha || !horario) {
      return res.status(400).json({
        error: 'Nombre del paciente, teléfono, fecha y horario son obligatorios'
      })
    }

    // Verificar traslape en el mismo horario y fecha
    const conflictoQuery = `
      SELECT id FROM citas 
      WHERE fecha = $1 AND horario = $2 AND deleted_at IS NULL AND estado != 'Cancelada'
    `
    const conflicto = await pool.query(conflictoQuery, [fecha, horario])
    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        error: `El horario ${horario} ya está reservado para la fecha ${fecha}. Elige otro horario.`
      })
    }

    const newId = await generarIdUnico('citas')
    const insertQuery = `
      INSERT INTO citas (id, nombre, correo, telefono, fecha, horario, notas, servicio, tipo, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Confirmada')
      RETURNING *
    `
    const { rows } = await pool.query(insertQuery, [
      newId, patientName, patientEmail, patientPhone, fecha, horario,
      notas || null, servicio || 'Consulta Nutricional', tipo || 'Presencial'
    ])

    res.status(201).json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la cita', detalle: error.message })
  }
}

// ─── PUT /api/citas/:id ────────────────────────────────────────────────────
export const updateCita = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, cliente_nombre, correo, cliente_correo, telefono, cliente_telefono, fecha, horario, estado, notas, servicio, tipo } = req.body

    const existing = await pool.query('SELECT * FROM citas WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    if (fecha && horario) {
      const conflictoQuery = `
        SELECT id FROM citas 
        WHERE fecha = $1 AND horario = $2 AND id != $3 AND deleted_at IS NULL AND estado != 'Cancelada'
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
      SET nombre = $1, correo = $2, telefono = $3, fecha = $4, horario = $5,
          estado = $6, notas = $7, servicio = $8, tipo = $9, updated_at = NOW()
      WHERE id = $10 AND deleted_at IS NULL
      RETURNING *
    `
    const { rows } = await pool.query(updateQuery, [
      nombre || cliente_nombre || current.nombre,
      correo || cliente_correo || current.correo,
      telefono || cliente_telefono || current.telefono,
      fecha || current.fecha,
      horario || current.horario,
      estado || current.estado,
      notas !== undefined ? notas : current.notas,
      servicio || current.servicio,
      tipo || current.tipo,
      id
    ])

    res.json(rows[0])
  } catch (error) {
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
    res.status(500).json({ error: 'Error al eliminar la cita', detalle: error.message })
  }
}
