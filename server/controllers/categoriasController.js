import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// ─── GET /api/categorias ───────────────────────────────────────────────────
export async function getCategorias(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, COALESCE(descripcion, '') AS descripcion,
              TO_CHAR(fecha_creacion, 'YYYY-MM-DD') AS "fechaAlta"
       FROM categorias
       WHERE deleted_at IS NULL
       ORDER BY id ASC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('getCategorias:', err.message)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
}

// ─── GET /api/categorias/:id ───────────────────────────────────────────────
export async function getCategoriaById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT id, nombre, COALESCE(descripcion, '') AS descripcion,
              TO_CHAR(fecha_creacion, 'YYYY-MM-DD') AS "fechaAlta"
       FROM categorias
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('getCategoriaById:', err.message)
    res.status(500).json({ error: 'Error al obtener categoría' })
  }
}

// ─── POST /api/categorias ──────────────────────────────────────────────────
export async function createCategoria(req, res) {
  const { nombre, descripcion } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  try {
    const newId = await generarIdUnico('categorias')

    const result = await pool.query(
      `INSERT INTO categorias (id, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, COALESCE(descripcion, '') AS descripcion, TO_CHAR(fecha_creacion, 'YYYY-MM-DD') AS "fechaAlta"`,
      [newId, nombre, descripcion || '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createCategoria:', err.message)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de categoría ya existe' })
    }
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

// ─── PUT /api/categorias/:id ───────────────────────────────────────────────
export async function updateCategoria(req, res) {
  const { id } = req.params
  const { nombre, descripcion } = req.body

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  try {
    const result = await pool.query(
      `UPDATE categorias
       SET nombre=$1, descripcion=$2, updated_at=NOW()
       WHERE id=$3 AND deleted_at IS NULL
       RETURNING id, nombre, COALESCE(descripcion, '') AS descripcion, TO_CHAR(fecha_creacion, 'YYYY-MM-DD') AS "fechaAlta"`,
      [nombre, descripcion || '', id]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('updateCategoria:', err.message)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de categoría ya existe' })
    }
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

// ─── DELETE /api/categorias/:id (soft delete) ──────────────────────────────
export async function deleteCategoria(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE categorias SET deleted_at=NOW()
       WHERE id=$1 AND deleted_at IS NULL RETURNING id`,
      [id]
    )
    if (!result.rows.length)
      return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json({ message: 'Categoría eliminada', id: result.rows[0].id })
  } catch (err) {
    console.error('deleteCategoria:', err.message)
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
}
