import pool from '../db/pool.js'

// GET /api/residentes — Obtener censo de residentes
export async function getResidentes(req, res) {
  try {
    const { centro = 'Casa Nostra', search = '' } = req.query

    let query = `
      SELECT id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones, activo,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM residentes
      WHERE centro_residencia = $1 AND activo = TRUE
    `
    const params = [centro]

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (nombre ILIKE $${params.length} OR habitacion ILIKE $${params.length} OR array_to_string(restricciones, ',') ILIKE $${params.length})`
    }

    query += ` ORDER BY habitacion ASC, nombre ASC`

    const result = await pool.query(query, params)

    res.json({
      success: true,
      total: result.rowCount,
      data: result.rows
    })
  } catch (err) {
    console.error('getResidentes error:', err.message)
    res.status(500).json({ error: 'Error al obtener los residentes', detalle: err.message })
  }
}

// GET /api/residentes/:id — Obtener ficha individual de un residente
export async function getResidenteById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM residentes WHERE id = $1 AND activo = TRUE`,
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Residente no encontrado o inactivo' })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (err) {
    console.error('getResidenteById error:', err.message)
    res.status(500).json({ error: 'Error al consultar el residente', detalle: err.message })
  }
}

// POST /api/residentes — Registrar nuevo residente
export async function createResidente(req, res) {
  try {
    const {
      id,
      centro_residencia = 'Casa Nostra',
      nombre,
      edad,
      habitacion,
      restricciones = [],
      asistencia = 'Comedor Autónomo',
      observaciones = ''
    } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del residente es obligatorio' })
    }
    if (!habitacion || !habitacion.trim()) {
      return res.status(400).json({ error: 'La habitación del residente es obligatoria' })
    }

    const resId = id && id.trim() ? id.trim() : `RES-${Math.floor(100 + Math.random() * 900)}`
    const parsedEdad = edad ? parseInt(edad, 10) : null
    const cleanHabitacion = habitacion.trim().toUpperCase()
    const cleanRestricciones = Array.isArray(restricciones) ? restricciones : [restricciones].filter(Boolean)

    const result = await pool.query(
      `INSERT INTO residentes (
        id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        edad = EXCLUDED.edad,
        habitacion = EXCLUDED.habitacion,
        restricciones = EXCLUDED.restricciones,
        asistencia = EXCLUDED.asistencia,
        observaciones = EXCLUDED.observaciones,
        activo = TRUE,
        updated_at = NOW()
      RETURNING *`,
      [
        resId,
        centro_residencia,
        nombre.trim(),
        parsedEdad,
        cleanHabitacion,
        cleanRestricciones,
        asistencia,
        observaciones.trim()
      ]
    )

    res.status(201).json({
      success: true,
      mensaje: 'Residente registrado con éxito',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('createResidente error:', err.message)
    res.status(500).json({ error: 'Error al crear el residente', detalle: err.message })
  }
}

// PUT /api/residentes/:id — Actualizar ficha de residente
export async function updateResidente(req, res) {
  const { id } = req.params
  try {
    const {
      nombre,
      edad,
      habitacion,
      restricciones,
      asistencia,
      observaciones
    } = req.body

    if (!nombre || !habitacion) {
      return res.status(400).json({ error: 'El nombre y la habitación son requeridos' })
    }

    const cleanHabitacion = habitacion.trim().toUpperCase()
    const cleanRestricciones = Array.isArray(restricciones) ? restricciones : []

    const result = await pool.query(
      `UPDATE residentes
       SET nombre = $1,
           edad = $2,
           habitacion = $3,
           restricciones = $4,
           asistencia = $5,
           observaciones = $6,
           updated_at = NOW()
       WHERE id = $7 AND activo = TRUE
       RETURNING *`,
      [
        nombre.trim(),
        edad ? parseInt(edad, 10) : null,
        cleanHabitacion,
        cleanRestricciones,
        asistencia || 'Comedor Autónomo',
        observaciones ? observaciones.trim() : '',
        id
      ]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Residente no encontrado para actualizar' })
    }

    res.json({
      success: true,
      mensaje: 'Ficha de residente actualizada',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('updateResidente error:', err.message)
    res.status(500).json({ error: 'Error al actualizar el residente', detalle: err.message })
  }
}

// DELETE /api/residentes/:id — Retirar residente del censo (Soft Delete)
export async function deleteResidente(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE residentes
       SET activo = FALSE,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, nombre`,
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Residente no encontrado' })
    }

    res.json({
      success: true,
      mensaje: `Residente "${result.rows[0].nombre}" retirado del censo activo`,
      data: result.rows[0]
    })
  } catch (err) {
    console.error('deleteResidente error:', err.message)
    res.status(500).json({ error: 'Error al dar de baja al residente', detalle: err.message })
  }
}

// POST /api/residentes/importar — Inserción masiva de residentes (Importación Excel)
export async function importarResidentes(req, res) {
  const client = await pool.connect()
  try {
    const { residentes = [], centro_residencia = 'Casa Nostra' } = req.body

    if (!Array.isArray(residentes) || residentes.length === 0) {
      return res.status(400).json({ error: 'La lista de residentes a importar está vacía o es inválida' })
    }

    await client.query('BEGIN')

    const importados = []

    for (let i = 0; i < residentes.length; i++) {
      const r = residentes[i]
      if (!r.nombre || !r.habitacion) continue

      const resId = r.id && r.id.trim() ? r.id.trim() : `RES-${Math.floor(100 + Math.random() * 900)}-XLS`
      const cleanHab = String(r.habitacion).trim().toUpperCase()
      const cleanRestr = Array.isArray(r.restricciones) ? r.restricciones : [r.restricciones].filter(Boolean)

      const ins = await client.query(
        `INSERT INTO residentes (
          id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones, activo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          edad = EXCLUDED.edad,
          habitacion = EXCLUDED.habitacion,
          restricciones = EXCLUDED.restricciones,
          asistencia = EXCLUDED.asistencia,
          observaciones = EXCLUDED.observaciones,
          activo = TRUE,
          updated_at = NOW()
        RETURNING *`,
        [
          resId,
          centro_residencia,
          r.nombre.trim(),
          r.edad ? parseInt(r.edad, 10) : 80,
          cleanHab,
          cleanRestr.length > 0 ? cleanRestr : ['Ninguna'],
          r.asistencia || 'Comedor Autónomo',
          r.observaciones ? r.observaciones.trim() : 'Importado vía Excel'
        ]
      )
      importados.push(ins.rows[0])
    }

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      mensaje: `Se importaron ${importados.length} residentes correctamente`,
      totalImportados: importados.length,
      data: importados
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('importarResidentes error:', err.message)
    res.status(500).json({ error: 'Error durante la importación masiva', detalle: err.message })
  } finally {
    client.release()
  }
}
