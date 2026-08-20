import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// GET /api/pacientes — Listar todos los pacientes / expedientes activos
export async function getPacientes(req, res) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT id, cita_id, nombre, correo, telefono, edad, ocupacion, fecha, horario, TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
      FROM pacientes
      WHERE deleted_at IS NULL
    `
    const params = []

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (nombre ILIKE $${params.length} OR telefono ILIKE $${params.length})`
    }

    // Cuenta total
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_q`
    const countResult = await pool.query(countQuery, params)
    const totalRecords = parseInt(countResult.rows[0].count, 10)
    const totalPages = Math.ceil(totalRecords / limit) || 1

    // Consulta de datos
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    res.json({
      data: result.rows,
      meta: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parseInt(limit, 10)
      }
    })
  } catch (err) {
    console.error('getPacientes error:', err.message)
    res.status(500).json({ error: 'Error al obtener los expedientes de pacientes', detalle: err.message })
  }
}

// GET /api/pacientes/:id — Obtener un paciente por ID
export async function getPacienteById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM pacientes
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('getPacienteById error:', err.message)
    res.status(500).json({ error: 'Error al obtener el expediente', detalle: err.message })
  }
}

// POST /api/pacientes — Crear un expediente de paciente
export async function createPaciente(req, res) {
  const {
    cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
    patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
    peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
    ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa, sexo
  } = req.body

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('pacientes')

    const result = await pool.query(
      `INSERT INTO pacientes (
        id, cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
        patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
        peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
        ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa, sexo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *`,
      [
        newId, cita_id || null, nombre, telefono, correo || null, edad || null,
        ocupacion || null, motivo_consulta || null, patologias || null,
        antecedentes_familiares || null, bioquimicos || null, farmacos || null,
        digestiva || null, peso ? parseFloat(peso) : null, estatura ? parseFloat(estatura) : null,
        circunferencias || null, composicion || null, recordatorio_24h || null,
        alergias || null, ultraprocesados || null, gustos || null,
        logistica_cocina || null, estilo_vida || null, fecha || null,
        horario || null, atencion_previa || 'no', sexo || null
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createPaciente error:', err.message)
    res.status(500).json({ error: 'Error al crear el expediente de paciente', detalle: err.message })
  }
}

// PUT /api/pacientes/:id — Editar un expediente de paciente
export async function updatePaciente(req, res) {
  const { id } = req.params
  const {
    cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
    patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
    peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
    ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa, sexo
  } = req.body

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' })
  }

  try {
    const result = await pool.query(
      `UPDATE pacientes SET
        cita_id = $1, nombre = $2, telefono = $3, correo = $4, edad = $5,
        ocupacion = $6, motivo_consulta = $7, patologias = $8,
        antecedentes_familiares = $9, bioquimicos = $10, farmacos = $11,
        digestiva = $12, peso = $13, estatura = $14, circunferencias = $15,
        composicion = $16, recordatorio_24h = $17, alergias = $18,
        ultraprocesados = $19, gustos = $20, logistica_cocina = $21,
        estilo_vida = $22, fecha = $23, horario = $24, atencion_previa = $25, sexo = $26,
        updated_at = NOW()
       WHERE id = $27 AND deleted_at IS NULL
       RETURNING *`,
      [
        cita_id || null, nombre, telefono, correo || null, edad || null,
        ocupacion || null, motivo_consulta || null, patologias || null,
        antecedentes_familiares || null, bioquimicos || null, farmacos || null,
        digestiva || null, peso ? parseFloat(peso) : null, estatura ? parseFloat(estatura) : null,
        circunferencias || null, composicion || null, recordatorio_24h || null,
        alergias || null, ultraprocesados || null, gustos || null,
        logistica_cocina || null, estilo_vida || null, fecha || null,
        horario || null, atencion_previa || 'no', sexo || null, id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente de paciente no encontrado' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('updatePaciente error:', err.message)
    res.status(500).json({ error: 'Error al actualizar el expediente de paciente', detalle: err.message })
  }
}

// DELETE /api/pacientes/:id — Soft delete
export async function deletePaciente(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE pacientes SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado o ya eliminado' })
    }
    res.json({ message: 'Expediente eliminado correctamente', id: result.rows[0].id })
  } catch (err) {
    console.error('deletePaciente error:', err.message)
    res.status(500).json({ error: 'Error al eliminar el expediente', detalle: err.message })
  }
}
