import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// ─── GET /api/expedientes/paciente/:pacienteId ──────────────────────────────
export async function getExpedienteByCliente(req, res) {
  const pacienteId = req.params.clienteId || req.params.pacienteId
  try {
    // 1. Obtener o crear el expediente del paciente
    let expResult = await pool.query(
      `SELECT e.id, e.paciente_id AS "pacienteId", e.diagnostico, e.objetivo_nutricional AS "objetivoNutricional",
              e.notas_medicas AS "notasMedicas", TO_CHAR(e.creado_en, 'YYYY-MM-DD') AS "fechaAlta"
       FROM expedientes_clinicos e
       WHERE e.paciente_id = $1`,
      [pacienteId]
    ).catch(() => ({ rows: [] }))

    // Fallback: intentar con cliente_id si la tabla aún tiene esa columna
    if (!expResult.rows.length) {
      expResult = await pool.query(
        `SELECT e.id, e.diagnostico, e.objetivo_nutricional AS "objetivoNutricional",
                e.notas_medicas AS "notasMedicas", TO_CHAR(e.creado_en, 'YYYY-MM-DD') AS "fechaAlta"
         FROM expedientes_clinicos e
         WHERE e.cliente_id = $1`,
        [pacienteId]
      ).catch(() => ({ rows: [] }))
    }

    // 2. Obtener historial de mediciones
    const medicionesResult = await pool.query(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, talla,
              brazo_relajado, brazo_flexionado,
              cintura, abdomen, cadera, muslo, pantorrilla,
              imc, indice_cc AS "indiceCC", riesgo_imc AS "riesgoImc", riesgo_cc AS "riesgoCc", observaciones
       FROM mediciones_antropometricas
       WHERE paciente_id = $1
       ORDER BY fecha ASC`,
      [pacienteId]
    )

    res.json({
      expediente: expResult.rows[0] || {},
      mediciones: medicionesResult.rows,
    })
  } catch (err) {
    console.error('getExpedienteByCliente:', err.message)
    res.status(500).json({ error: 'Error al obtener el expediente clínico' })
  }
}

// ─── POST /api/expedientes/mediciones ──────────────────────────────────────
export async function createMedicion(req, res) {
  const {
    pacienteId,
    clienteId,  // retrocompatibilidad
    fecha = new Date().toISOString().split('T')[0],
    peso, talla = null,
    brazoRelajado = null, brazoFlexionado = null,
    cintura = null, abdomen = null, cadera = null,
    muslo = null, pantorrilla = null,
    imc = null, indiceCC = null,
    riesgoImc = null, riesgoCc = null,
    observaciones = '',
  } = req.body

  const idPaciente = pacienteId || clienteId

  if (!idPaciente || peso === undefined) {
    return res.status(400).json({ error: 'pacienteId y peso son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('mediciones_antropometricas')
    const result = await pool.query(
      `INSERT INTO mediciones_antropometricas (
        id, paciente_id, fecha, peso, talla, brazo_relajado, brazo_flexionado,
        cintura, abdomen, cadera, muslo, pantorrilla, imc, indice_cc, riesgo_imc, riesgo_cc, observaciones
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, talla,
                 brazo_relajado, brazo_flexionado,
                 cintura, abdomen, cadera, muslo, pantorrilla,
                 imc, indice_cc AS "indiceCC", riesgo_imc AS "riesgoImc", riesgo_cc AS "riesgoCc", observaciones`,
      [
        newId, idPaciente, fecha, peso, talla, brazoRelajado, brazoFlexionado,
        cintura, abdomen, cadera, muslo, pantorrilla, imc, indiceCC, riesgoImc, riesgoCc, observaciones,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createMedicion:', err.message)
    res.status(500).json({ error: 'Error al registrar la medición antropométrica', detalle: err.message })
  }
}

// ─── PUT /api/expedientes/mediciones/:id ───────────────────────────────────
export async function updateMedicion(req, res) {
  const { id } = req.params
  const {
    fecha, peso, talla,
    brazoRelajado, brazoFlexionado,
    cintura, abdomen, cadera, muslo, pantorrilla,
    imc, indiceCC, riesgoImc, riesgoCc, observaciones,
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE mediciones_antropometricas SET
        fecha = COALESCE($1, fecha),
        peso = COALESCE($2, peso),
        talla = COALESCE($3, talla),
        brazo_relajado = COALESCE($4, brazo_relajado),
        brazo_flexionado = COALESCE($5, brazo_flexionado),
        cintura = COALESCE($6, cintura),
        abdomen = COALESCE($7, abdomen),
        cadera = COALESCE($8, cadera),
        muslo = COALESCE($9, muslo),
        pantorrilla = COALESCE($10, pantorrilla),
        imc = COALESCE($11, imc),
        indice_cc = COALESCE($12, indice_cc),
        riesgo_imc = COALESCE($13, riesgo_imc),
        riesgo_cc = COALESCE($14, riesgo_cc),
        observaciones = COALESCE($15, observaciones)
       WHERE id = $16
       RETURNING id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, talla,
                 brazo_relajado, brazo_flexionado,
                 cintura, abdomen, cadera, muslo, pantorrilla, observaciones`,
      [
        fecha || null, peso ? parseFloat(peso) : null, talla ? parseFloat(talla) : null,
        brazoRelajado ? parseFloat(brazoRelajado) : null, brazoFlexionado ? parseFloat(brazoFlexionado) : null,
        cintura ? parseFloat(cintura) : null, abdomen ? parseFloat(abdomen) : null,
        cadera ? parseFloat(cadera) : null, muslo ? parseFloat(muslo) : null,
        pantorrilla ? parseFloat(pantorrilla) : null,
        imc || null, indiceCC || null, riesgoImc || null, riesgoCc || null,
        observaciones !== undefined ? observaciones : null,
        id,
      ]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Medición no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('updateMedicion:', err.message)
    res.status(500).json({ error: 'Error al actualizar la medición', detalle: err.message })
  }
}

// ─── DELETE /api/expedientes/mediciones/:id ────────────────────────────────
export async function deleteMedicion(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      'DELETE FROM mediciones_antropometricas WHERE id = $1 RETURNING id',
      [id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Medición no encontrada' })
    res.json({ message: 'Medición eliminada', id: result.rows[0].id })
  } catch (err) {
    console.error('deleteMedicion:', err.message)
    res.status(500).json({ error: 'Error al eliminar la medición' })
  }
}

// ─── PUT /api/expedientes/paciente/:pacienteId ─────────────────────────────
export async function updateExpediente(req, res) {
  const pacienteId = req.params.clienteId || req.params.pacienteId
  const { diagnostico, objetivoNutricional, notasMedicas } = req.body

  try {
    // Intentar con paciente_id primero, luego cliente_id
    const checkResult = await pool.query(
      `SELECT id FROM expedientes_clinicos 
       WHERE paciente_id = $1 OR cliente_id = $1 
       LIMIT 1`,
      [pacienteId]
    )

    let result
    if (checkResult.rows.length === 0) {
      const newExpId = await generarIdUnico('expedientes_clinicos')
      result = await pool.query(
        `INSERT INTO expedientes_clinicos (id, paciente_id, diagnostico, objetivo_nutricional, notas_medicas)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, diagnostico, objetivo_nutricional AS "objetivoNutricional", notas_medicas AS "notasMedicas"`,
        [newExpId, pacienteId, diagnostico || null, objetivoNutricional || null, notasMedicas || null]
      ).catch(async () => {
        // Si falla paciente_id, intentar con cliente_id (migración parcial)
        return pool.query(
          `INSERT INTO expedientes_clinicos (id, cliente_id, diagnostico, objetivo_nutricional, notas_medicas)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, diagnostico, objetivo_nutricional AS "objetivoNutricional", notas_medicas AS "notasMedicas"`,
          [newExpId, pacienteId, diagnostico || null, objetivoNutricional || null, notasMedicas || null]
        )
      })
    } else {
      result = await pool.query(
        `UPDATE expedientes_clinicos
         SET diagnostico = COALESCE($1, diagnostico),
             objetivo_nutricional = COALESCE($2, objetivo_nutricional),
             notas_medicas = COALESCE($3, notas_medicas)
         WHERE id = $4
         RETURNING id, diagnostico, objetivo_nutricional AS "objetivoNutricional", notas_medicas AS "notasMedicas"`,
        [diagnostico, objetivoNutricional, notasMedicas, checkResult.rows[0].id]
      )
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('updateExpediente:', err.message)
    res.status(500).json({ error: 'Error al actualizar el expediente', detalle: err.message })
  }
}
