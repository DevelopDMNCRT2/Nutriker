import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

/**
 * Controlador de Ingresos y Tesorería
 */

// ─── GET /api/ingresos ───────────────────────────────────────────────────────
export const getIngresos = async (req, res) => {
  try {
    const query = `
      SELECT id,
             TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha",
             concepto,
             a_nombre_de,
             recibe,
             cantidad,
             metodo_pago,
             notas,
             created_at,
             updated_at
      FROM ingresos 
      WHERE deleted_at IS NULL 
      ORDER BY fecha DESC, created_at DESC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error('getIngresos error:', error.message)
    res.status(500).json({ error: 'Error al obtener ingresos', detalle: error.message })
  }
}

// ─── GET /api/ingresos/:id ───────────────────────────────────────────────────
export const getIngresoById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT id,
             TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha",
             concepto,
             a_nombre_de,
             recibe,
             cantidad,
             metodo_pago,
             notas,
             created_at,
             updated_at
      FROM ingresos 
      WHERE id = $1 AND deleted_at IS NULL
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro de ingreso no encontrado' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('getIngresoById error:', error.message)
    res.status(500).json({ error: 'Error al obtener el ingreso', detalle: error.message })
  }
}

// ─── POST /api/ingresos ──────────────────────────────────────────────────────
export const createIngreso = async (req, res) => {
  try {
    const { concepto, a_nombre_de, recibe, cantidad, metodo_pago, fecha, notas } = req.body

    if (!concepto || !a_nombre_de || cantidad === undefined || cantidad === null) {
      return res.status(400).json({
        error: 'El concepto, a nombre de quién y la cantidad son obligatorios'
      })
    }

    const newId = await generarIdUnico('ingresos')
    const insertQuery = `
      INSERT INTO ingresos (id, fecha, concepto, a_nombre_de, recibe, cantidad, metodo_pago, notas)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha"
    `
    const { rows } = await pool.query(insertQuery, [
      newId,
      fecha || new Date().toISOString().split('T')[0],
      concepto,
      a_nombre_de,
      recibe || 'Dra. Alexa Lora',
      parseFloat(cantidad) || 0,
      metodo_pago || 'Efectivo',
      notas || null
    ])

    res.status(201).json(rows[0])
  } catch (error) {
    console.error('createIngreso error:', error.message)
    res.status(500).json({ error: 'Error al registrar el ingreso', detalle: error.message })
  }
}

// ─── PUT /api/ingresos/:id ───────────────────────────────────────────────────
export const updateIngreso = async (req, res) => {
  try {
    const { id } = req.params
    const { concepto, a_nombre_de, recibe, cantidad, metodo_pago, fecha, notas } = req.body

    const existing = await pool.query('SELECT * FROM ingresos WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de ingreso no encontrado' })
    }

    const current = existing.rows[0]
    const updateQuery = `
      UPDATE ingresos 
      SET concepto = $1, a_nombre_de = $2, recibe = $3, cantidad = $4,
          metodo_pago = $5, fecha = $6, notas = $7, updated_at = NOW()
      WHERE id = $8 AND deleted_at IS NULL
      RETURNING *, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha"
    `
    const { rows } = await pool.query(updateQuery, [
      concepto || current.concepto,
      a_nombre_de || current.a_nombre_de,
      recibe || current.recibe,
      cantidad !== undefined ? parseFloat(cantidad) : current.cantidad,
      metodo_pago || current.metodo_pago,
      fecha || current.fecha,
      notas !== undefined ? notas : current.notas,
      id
    ])

    res.json(rows[0])
  } catch (error) {
    console.error('updateIngreso error:', error.message)
    res.status(500).json({ error: 'Error al actualizar el ingreso', detalle: error.message })
  }
}

// ─── DELETE /api/ingresos/:id (Soft Delete) ──────────────────────────────────
export const deleteIngreso = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      UPDATE ingresos 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro de ingreso no encontrado' })
    }
    res.json({ message: 'Registro de ingreso eliminado correctamente', id: rows[0].id })
  } catch (error) {
    console.error('deleteIngreso error:', error.message)
    res.status(500).json({ error: 'Error al eliminar el ingreso', detalle: error.message })
  }
}
