import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// GET /api/clientes — Listar todos los clientes / expedientes activos
export async function getClientes(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM clientes
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('getClientes error:', err.message)
    res.status(500).json({ error: 'Error al obtener los expedientes de clientes', detalle: err.message })
  }
}

// GET /api/clientes/:id — Obtener un cliente por ID
export async function getClienteById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM clientes
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('getClienteById error:', err.message)
    res.status(500).json({ error: 'Error al obtener el expediente', detalle: err.message })
  }
}

// POST /api/clientes — Crear un expediente de cliente
export async function createCliente(req, res) {
  const {
    cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
    patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
    peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
    ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa
  } = req.body

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('clientes')

    const result = await pool.query(
      `INSERT INTO clientes (
        id, cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
        patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
        peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
        ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *`,
      [
        newId, cita_id || null, nombre, telefono, correo || null, edad || null,
        ocupacion || null, motivo_consulta || null, patologias || null,
        antecedentes_familiares || null, bioquimicos || null, farmacos || null,
        digestiva || null, peso ? parseFloat(peso) : null, estatura ? parseFloat(estatura) : null,
        circunferencias || null, composicion || null, recordatorio_24h || null,
        alergias || null, ultraprocesados || null, gustos || null,
        logistica_cocina || null, estilo_vida || null, fecha || null,
        horario || null, atencion_previa || 'no'
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createCliente error:', err.message)
    res.status(500).json({ error: 'Error al crear el expediente de cliente', detalle: err.message })
  }
}

// PUT /api/clientes/:id — Editar un expediente de cliente
export async function updateCliente(req, res) {
  const { id } = req.params
  const {
    cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
    patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
    peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
    ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa
  } = req.body

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' })
  }

  try {
    const result = await pool.query(
      `UPDATE clientes SET
        cita_id = $1, nombre = $2, telefono = $3, correo = $4, edad = $5,
        ocupacion = $6, motivo_consulta = $7, patologias = $8,
        antecedentes_familiares = $9, bioquimicos = $10, farmacos = $11,
        digestiva = $12, peso = $13, estatura = $14, circunferencias = $15,
        composicion = $16, recordatorio_24h = $17, alergias = $18,
        ultraprocesados = $19, gustos = $20, logistica_cocina = $21,
        estilo_vida = $22, fecha = $23, horario = $24, atencion_previa = $25,
        updated_at = NOW()
       WHERE id = $26 AND deleted_at IS NULL
       RETURNING *`,
      [
        cita_id || null, nombre, telefono, correo || null, edad || null,
        ocupacion || null, motivo_consulta || null, patologias || null,
        antecedentes_familiares || null, bioquimicos || null, farmacos || null,
        digestiva || null, peso ? parseFloat(peso) : null, estatura ? parseFloat(estatura) : null,
        circunferencias || null, composicion || null, recordatorio_24h || null,
        alergias || null, ultraprocesados || null, gustos || null,
        logistica_cocina || null, estilo_vida || null, fecha || null,
        horario || null, atencion_previa || 'no', id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente de cliente no encontrado' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('updateCliente error:', err.message)
    res.status(500).json({ error: 'Error al actualizar el expediente de cliente', detalle: err.message })
  }
}

// DELETE /api/clientes/:id — Soft delete
export async function deleteCliente(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE clientes SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente no encontrado o ya eliminado' })
    }
    res.json({ message: 'Expediente eliminado correctamente', id: result.rows[0].id })
  } catch (err) {
    console.error('deleteCliente error:', err.message)
    res.status(500).json({ error: 'Error al eliminar el expediente', detalle: err.message })
  }
}
