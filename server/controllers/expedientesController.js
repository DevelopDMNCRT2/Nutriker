import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// ─── GET /api/expedientes/cliente/:clienteId ───────────────────────────────
export async function getExpedienteByCliente(req, res) {
  const { clienteId } = req.params
  try {
    // 1. Obtener o crear el expediente del cliente
    let expResult = await pool.query(
      `SELECT e.id, e.cliente_id AS "clienteId", e.diagnostico, e.objetivo_nutricional AS "objetivoNutricional",
              e.notas_medicas AS "notasMedicas", TO_CHAR(e.creado_en, 'YYYY-MM-DD') AS "fechaAlta"
       FROM expedientes_clinicos e
       WHERE e.cliente_id = $1`,
      [clienteId]
    )

    if (!expResult.rows.length) {
      // Si aún no tiene expediente creado, generar uno básico por defecto
      const newExpId = await generarIdUnico('expedientes_clinicos')
      await pool.query(
        `INSERT INTO expedientes_clinicos (id, cliente_id, diagnostico, objetivo_nutricional, notas_medicas)
         VALUES ($1, $2, $3, $4, $5)`,
        [newExpId, clienteId, 'Paciente en seguimiento nutricional continuo.', 'Mejorar composición corporal y hábitos de salud.', 'Acepta plan de alimentación personalizado.']
      )
      expResult = await pool.query(
        `SELECT e.id, e.cliente_id AS "clienteId", e.diagnostico, e.objetivo_nutricional AS "objetivoNutricional",
                e.notas_medicas AS "notasMedicas", TO_CHAR(e.creado_en, 'YYYY-MM-DD') AS "fechaAlta"
         FROM expedientes_clinicos e
         WHERE e.cliente_id = $1`,
        [clienteId]
      )
    }

    // 2. Obtener el historial de mediciones antropométricas
    const medicionesResult = await pool.query(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, talla,
              brazo_relajado AS "brazoRelajado", brazo_flexionado AS "brazoFlexionado",
              cintura, abdomen, cadera, muslo, pantorrilla,
              imc, indice_cc AS "indiceCC", riesgo_imc AS "riesgoImc", riesgo_cc AS "riesgoCc", observaciones
       FROM mediciones_antropometricas
       WHERE cliente_id = $1
       ORDER BY fecha ASC`,
      [clienteId]
    )

    res.json({
      expediente: expResult.rows[0],
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
        id, cliente_id, fecha, peso, talla, brazo_relajado, brazo_flexionado,
        cintura, abdomen, cadera, muslo, pantorrilla, imc, indice_cc, riesgo_imc, riesgo_cc, observaciones
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, talla,
                 brazo_relajado AS "brazo_relajado", brazo_flexionado AS "brazo_flexionado",
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
    res.status(500).json({ error: 'Error al registrar la medición antropométrica' })
  }
}

// ─── PUT /api/expedientes/cliente/:clienteId ───────────────────────────────
export async function updateExpediente(req, res) {
  const { clienteId } = req.params
  const { diagnostico, objetivoNutricional, notasMedicas } = req.body

  try {
    // 1. Verificar si ya existe un expediente registrado para el cliente
    const checkResult = await pool.query(
      'SELECT id FROM expedientes_clinicos WHERE cliente_id = $1',
      [clienteId]
    )

    let result
    if (checkResult.rows.length === 0) {
      // 2. Si no existe, crear el expediente inicial con los datos provistos
      const newExpId = await generarIdUnico('expedientes_clinicos')
      result = await pool.query(
        `INSERT INTO expedientes_clinicos (id, cliente_id, diagnostico, objetivo_nutricional, notas_medicas)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, cliente_id AS "clienteId", diagnostico, objetivo_nutricional AS "objetivoNutricional",
                   notas_medicas AS "notasMedicas"`,
        [newExpId, clienteId, diagnostico || null, objetivoNutricional || null, notasMedicas || null]
      )
    } else {
      // 3. Si ya existe, actualizar únicamente los datos provistos
      result = await pool.query(
        `UPDATE expedientes_clinicos
         SET diagnostico = COALESCE($1, diagnostico),
             objetivo_nutricional = COALESCE($2, objetivo_nutricional),
             notas_medicas = COALESCE($3, notas_medicas),
             updated_at = NOW()
         WHERE cliente_id = $4
         RETURNING id, cliente_id AS "clienteId", diagnostico, objetivo_nutricional AS "objetivoNutricional",
                   notas_medicas AS "notasMedicas"`,
        [diagnostico, objetivoNutricional, notasMedicas, clienteId]
      )
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('updateExpediente:', err.message)
    res.status(500).json({ error: 'Error al actualizar el expediente' })
  }
}
