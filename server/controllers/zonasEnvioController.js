import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// ─── GET /api/zonas-envio ──────────────────────────────────────────────────
export async function getZonasEnvio(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, tipo_region AS "tipoRegion", costo, tiempo_entrega AS "tiempoEntrega",
              activa, TO_CHAR(creado_en, 'YYYY-MM-DD') AS "fechaAlta"
       FROM zonas_envio
       WHERE deleted_at IS NULL
       ORDER BY creado_en DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('getZonasEnvio:', err.message)
    res.status(500).json({ error: 'Error al obtener zonas de envío' })
  }
}

// ─── GET /api/zonas-envio/:id ──────────────────────────────────────────────
export async function getZonaEnvioById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT id, nombre, tipo_region AS "tipoRegion", costo, tiempo_entrega AS "tiempoEntrega",
              activa, TO_CHAR(creado_en, 'YYYY-MM-DD') AS "fechaAlta"
       FROM zonas_envio
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Zona de envío no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('getZonaEnvioById:', err.message)
    res.status(500).json({ error: 'Error al obtener la zona de envío' })
  }
}

// ─── POST /api/zonas-envio ─────────────────────────────────────────────────
export async function createZonaEnvio(req, res) {
  const { nombre, tipoRegion = 'Local', costo = 0, tiempoEntrega = '24 a 48 horas', activa = true } = req.body

  if (!nombre || costo === undefined) {
    return res.status(400).json({ error: 'Nombre y costo son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('zonas_envio')
    const result = await pool.query(
      `INSERT INTO zonas_envio (id, nombre, tipo_region, costo, tiempo_entrega, activa)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, tipo_region AS "tipoRegion", costo, tiempo_entrega AS "tiempoEntrega",
                 activa, TO_CHAR(creado_en, 'YYYY-MM-DD') AS "fechaAlta"`,
      [newId, nombre, tipoRegion, costo, tiempoEntrega, activa]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createZonaEnvio:', err.message)
    res.status(500).json({ error: 'Error al crear la zona de envío' })
  }
}

// ─── PUT /api/zonas-envio/:id ──────────────────────────────────────────────
export async function updateZonaEnvio(req, res) {
  const { id } = req.params
  const { nombre, tipoRegion, costo, tiempoEntrega, activa } = req.body

  try {
    const result = await pool.query(
      `UPDATE zonas_envio
       SET nombre = COALESCE($1, nombre),
           tipo_region = COALESCE($2, tipo_region),
           costo = COALESCE($3, costo),
           tiempo_entrega = COALESCE($4, tiempo_entrega),
           activa = COALESCE($5, activa),
           updated_at = NOW()
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING id, nombre, tipo_region AS "tipoRegion", costo, tiempo_entrega AS "tiempoEntrega",
                 activa, TO_CHAR(creado_en, 'YYYY-MM-DD') AS "fechaAlta"`,
      [nombre, tipoRegion, costo, tiempoEntrega, activa, id]
    )

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Zona de envío no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('updateZonaEnvio:', err.message)
    res.status(500).json({ error: 'Error al actualizar la zona de envío' })
  }
}

// ─── DELETE /api/zonas-envio/:id ───────────────────────────────────────────
export async function deleteZonaEnvio(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE zonas_envio
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    )
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Zona de envío no encontrada' })
    }
    res.json({ message: 'Zona de envío eliminada correctamente', id })
  } catch (err) {
    console.error('deleteZonaEnvio:', err.message)
    res.status(500).json({ error: 'Error al eliminar la zona de envío' })
  }
}
