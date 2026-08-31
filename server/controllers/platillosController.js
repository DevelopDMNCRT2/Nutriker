import pool from '../db/pool.js'

async function generarIdUnico(tabla) {
  while (true) {
    const id = Math.floor(10000000 + Math.random() * 90000000).toString()
    const { rows } = await pool.query(`SELECT id FROM ${tabla} WHERE id = $1`, [id])
    if (rows.length === 0) return id
  }
}

// GET /api/platillos
export async function getPlatillos(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, nombre, receta, info_nutricional, costos, created_at, updated_at 
      FROM platillos 
      WHERE deleted_at IS NULL 
      ORDER BY nombre ASC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener platillos:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/platillos/:id
export async function getPlatilloById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(`
      SELECT id, nombre, receta, info_nutricional, costos, created_at, updated_at 
      FROM platillos 
      WHERE id = $1 AND deleted_at IS NULL
    `, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Platillo no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error al obtener platillo:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/platillos
export async function createPlatillo(req, res) {
  const { nombre, receta = '', info_nutricional = {}, costos = [] } = req.body
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del platillo es obligatorio' })
  }

  try {
    const newId = await generarIdUnico('platillos')
    const result = await pool.query(`
      INSERT INTO platillos (id, nombre, receta, info_nutricional, costos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [newId, nombre, receta, JSON.stringify(info_nutricional), JSON.stringify(costos)])
    
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un platillo con ese nombre' })
    }
    console.error('Error al crear platillo:', err.message)
    res.status(500).json({ error: 'Error al crear el platillo' })
  }
}

// PUT /api/platillos/:id
export async function updatePlatillo(req, res) {
  const { id } = req.params
  const { nombre, receta, info_nutricional, costos } = req.body

  try {
    const setClauses = []
    const values = []
    let idx = 1

    if (nombre !== undefined) { setClauses.push(`nombre = $${idx++}`); values.push(nombre) }
    if (receta !== undefined) { setClauses.push(`receta = $${idx++}`); values.push(receta) }
    if (info_nutricional !== undefined) { setClauses.push(`info_nutricional = $${idx++}`); values.push(JSON.stringify(info_nutricional)) }
    if (costos !== undefined) { setClauses.push(`costos = $${idx++}`); values.push(JSON.stringify(costos)) }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' })
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE platillos 
      SET ${setClauses.join(', ')} 
      WHERE id = $${idx} AND deleted_at IS NULL 
      RETURNING *
    `

    const result = await pool.query(query, values)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Platillo no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un platillo con ese nombre' })
    }
    console.error('Error al actualizar platillo:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/platillos/:id
export async function deletePlatillo(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(`
      UPDATE platillos 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Platillo no encontrado' })
    }
    res.json({ message: 'Platillo eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar platillo:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
