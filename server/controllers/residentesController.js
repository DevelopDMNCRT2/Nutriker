import crypto from 'crypto'
import pool from '../db/pool.js'

// Normalizador de claves para importación (minúsculas y sin acentos)
function normalizarClave(key) {
  return String(key ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// GET /api/residentes — Obtener censo de residentes
export async function getResidentes(req, res) {
  try {
    const { centro = 'Casa Nostra', search = '' } = req.query
    const cleanSearch = String(search ?? '').trim()

    let query = `
      SELECT id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones, activo,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM residentes
      WHERE centro_residencia = $1 AND activo = TRUE
    `
    const params = [String(centro ?? 'Casa Nostra').trim()]

    if (cleanSearch) {
      params.push(`%${cleanSearch}%`)
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
    res.status(500).json({ error: 'Error al obtener los residentes' })
  }
}

// GET /api/residentes/:id — Obtener ficha individual de un residente
export async function getResidenteById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM residentes WHERE id = $1 AND activo = TRUE`,
      [String(id ?? '').trim()]
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
    res.status(500).json({ error: 'Error al consultar el residente' })
  }
}

// POST /api/residentes — Registrar nuevo residente (ID generado en servidor, sin colisiones)
export async function createResidente(req, res) {
  try {
    const {
      centro_residencia = 'Casa Nostra',
      nombre,
      edad,
      habitacion,
      restricciones = [],
      asistencia = 'Comedor Autónomo',
      observaciones = ''
    } = req.body

    const cleanNombre = String(nombre ?? '').trim()
    const cleanHabitacion = String(habitacion ?? '').trim().toUpperCase()

    if (!cleanNombre) {
      return res.status(400).json({ error: 'El nombre del residente es obligatorio' })
    }
    if (!cleanHabitacion) {
      return res.status(400).json({ error: 'La habitación del residente es obligatoria' })
    }

    // Generar ID único seguro UUID en servidor
    const resId = crypto.randomUUID()
    const parsedEdad = edad && !isNaN(parseInt(edad, 10)) ? parseInt(edad, 10) : null
    const cleanRestricciones = Array.isArray(restricciones) 
      ? restricciones.map(r => String(r).trim()).filter(Boolean)
      : (restricciones ? [String(restricciones).trim()] : [])
    const cleanAsistencia = String(asistencia ?? 'Comedor Autónomo').trim()
    const cleanObservaciones = String(observaciones ?? '').trim()

    const result = await pool.query(
      `INSERT INTO residentes (
        id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *`,
      [
        resId,
        String(centro_residencia ?? 'Casa Nostra').trim(),
        cleanNombre,
        parsedEdad,
        cleanHabitacion,
        cleanRestricciones,
        cleanAsistencia,
        cleanObservaciones
      ]
    )

    res.status(201).json({
      success: true,
      mensaje: 'Residente registrado con éxito',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('createResidente error:', err.message)
    res.status(500).json({ error: 'Error al crear el residente' })
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

    const cleanNombre = String(nombre ?? '').trim()
    const cleanHabitacion = String(habitacion ?? '').trim().toUpperCase()

    if (!cleanNombre || !cleanHabitacion) {
      return res.status(400).json({ error: 'El nombre y la habitación son requeridos' })
    }

    const cleanRestricciones = Array.isArray(restricciones)
      ? restricciones.map(r => String(r).trim()).filter(Boolean)
      : (restricciones ? [String(restricciones).trim()] : [])
    const parsedEdad = edad && !isNaN(parseInt(edad, 10)) ? parseInt(edad, 10) : null
    const cleanAsistencia = String(asistencia ?? 'Comedor Autónomo').trim()
    const cleanObservaciones = String(observaciones ?? '').trim()

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
        cleanNombre,
        parsedEdad,
        cleanHabitacion,
        cleanRestricciones,
        cleanAsistencia,
        cleanObservaciones,
        String(id ?? '').trim()
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
    res.status(500).json({ error: 'Error al actualizar el residente' })
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
      [String(id ?? '').trim()]
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
    res.status(500).json({ error: 'Error al dar de baja al residente' })
  }
}

// POST /api/residentes/importar — Inserción masiva de residentes (Importación Excel robusta)
export async function importarResidentes(req, res) {
  const client = await pool.connect()
  try {
    const { residentes = [], centro_residencia = 'Casa Nostra' } = req.body

    if (!Array.isArray(residentes) || residentes.length === 0) {
      return res.status(400).json({ error: 'La lista de residentes a importar está vacía o es inválida' })
    }

    if (residentes.length > 500) {
      return res.status(400).json({ error: 'El archivo excede el límite máximo de 500 registros por importación' })
    }

    await client.query('BEGIN')

    const importados = []
    const omitidos = []

    for (let i = 0; i < residentes.length; i++) {
      const rawRow = residentes[i]
      if (!rawRow || typeof rawRow !== 'object') continue

      // Normalizar claves del objeto Excel para evitar problemas con acentos o mayúsculas
      const rowNorm = {}
      for (const [k, v] of Object.entries(rawRow)) {
        rowNorm[normalizarClave(k)] = v
      }

      // Extraer datos con búsqueda de variantes habituales de encabezados
      const rawNombre = rowNorm['nombre'] || rowNorm['residente'] || rowNorm['paciente'] || rowNorm['nombre completo']
      const rawHabitacion = rowNorm['habitacion'] || rowNorm['hab'] || rowNorm['cuarto'] || rowNorm['habitacion/cama']
      const rawEdad = rowNorm['edad'] || rowNorm['anos'] || rowNorm['age']
      const rawRestricciones = rowNorm['restricciones'] || rowNorm['restriccion'] || rowNorm['alergias'] || rowNorm['dieta']
      const rawAsistencia = rowNorm['asistencia'] || rowNorm['apoyo'] || rowNorm['tipo asistencia']
      const rawObservaciones = rowNorm['observaciones'] || rowNorm['notas'] || rowNorm['comentarios']

      const cleanNombre = String(rawNombre ?? '').trim()
      const cleanHab = String(rawHabitacion ?? '').trim().toUpperCase()

      // Si falta nombre o habitación, rechazar fila para no corromper datos clínicos
      if (!cleanNombre || !cleanHab) {
        omitidos.push({ fila: i + 1, motivo: 'Nombre o habitación no especificados' })
        continue
      }

      // Procesar restricciones: solo guardar lo que explícitamente se especifique, NO inventar "Ninguna"
      let cleanRestr = []
      if (Array.isArray(rawRestricciones)) {
        cleanRestr = rawRestricciones.map(r => String(r).trim()).filter(Boolean)
      } else if (rawRestricciones && typeof rawRestricciones === 'string') {
        cleanRestr = rawRestricciones
          .split(/[,;\n]+/)
          .map(r => r.trim())
          .filter(r => r.length > 0 && r.toLowerCase() !== 'ninguna' && r.toLowerCase() !== 'ninguno')
      }

      const resId = crypto.randomUUID()
      const parsedEdad = rawEdad && !isNaN(parseInt(rawEdad, 10)) ? parseInt(rawEdad, 10) : null
      const cleanAsistencia = String(rawAsistencia ?? 'Comedor Autónomo').trim()
      const cleanObservaciones = String(rawObservaciones ?? '').trim()

      const ins = await client.query(
        `INSERT INTO residentes (
          id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones, activo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        RETURNING *`,
        [
          resId,
          String(centro_residencia ?? 'Casa Nostra').trim(),
          cleanNombre,
          parsedEdad,
          cleanHab,
          cleanRestr,
          cleanAsistencia,
          cleanObservaciones
        ]
      )
      importados.push(ins.rows[0])
    }

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      mensaje: `Se importaron ${importados.length} residentes correctamente`,
      totalImportados: importados.length,
      omitidosCount: omitidos.length,
      omitidos,
      data: importados
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('importarResidentes error:', err.message)
    res.status(500).json({ error: 'Error durante la importación masiva de residentes' })
  } finally {
    client.release()
  }
}
