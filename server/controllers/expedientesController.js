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
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, porcentaje_grasa AS "porcentajeGrasa",
              masa_muscular AS "masaMuscular", porcentaje_agua AS "porcentajeAgua",
              grasa_visceral AS "grasaVisceral", cintura, cadera, brazo, observaciones
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
    clienteId,
    fecha = new Date().toISOString().split('T')[0],
    peso,
    porcentajeGrasa = null,
    masaMuscular = null,
    porcentajeAgua = null,
    grasaVisceral = null,
    cintura = null,
    cadera = null,
    brazo = null,
    observaciones = '',
  } = req.body

  if (!clienteId || peso === undefined) {
    return res.status(400).json({ error: 'clienteId y peso son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('mediciones_antropometricas')
    const result = await pool.query(
      `INSERT INTO mediciones_antropometricas (
        id, cliente_id, fecha, peso, porcentaje_grasa, masa_muscular,
        porcentaje_agua, grasa_visceral, cintura, cadera, brazo, observaciones
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, TO_CHAR(fecha, 'YYYY-MM-DD') AS "fecha", peso, porcentaje_grasa AS "porcentajeGrasa",
                 masa_muscular AS "masaMuscular", porcentaje_agua AS "porcentajeAgua",
                 grasa_visceral AS "grasaVisceral", cintura, cadera, brazo, observaciones`,
      [
        newId, clienteId, fecha, peso, porcentajeGrasa, masaMuscular,
        porcentajeAgua, grasaVisceral, cintura, cadera, brazo, observaciones,
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
    const result = await pool.query(
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

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('updateExpediente:', err.message)
    res.status(500).json({ error: 'Error al actualizar el expediente' })
  }
}
