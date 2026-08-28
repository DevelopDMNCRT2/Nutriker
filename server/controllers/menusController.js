import pool from '../db/pool.js'

async function generarIdUnico(tabla) {
  while (true) {
    const id = Math.floor(10000000 + Math.random() * 90000000).toString()
    const { rows } = await pool.query(`SELECT id FROM ${tabla} WHERE id = $1`, [id])
    if (rows.length === 0) return id
  }
}

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const TIEMPOS = ['desayuno', 'colacion_am', 'comida', 'colacion_pm', 'cena']

const columnasMenu = DIAS.flatMap(dia => TIEMPOS.map(t => `${dia}_${t}`))

// ─── GET /api/menus/paciente/:pacienteId ───────────────────────────────────
export async function getMenusByPaciente(req, res) {
  const { pacienteId } = req.params
  try {
    const result = await pool.query(
      `SELECT id, paciente_id AS "pacienteId", nombre,
              TO_CHAR(semana_inicio, 'YYYY-MM-DD') AS "semanaInicio",
              ${columnasMenu.join(', ')},
              notas, created_at AS "createdAt"
       FROM menus_semanales
       WHERE paciente_id = $1
       ORDER BY semana_inicio DESC`,
      [pacienteId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('getMenusByPaciente:', err.message)
    res.status(500).json({ error: 'Error al obtener los menús del paciente' })
  }
}

// ─── GET /api/menus/:id ────────────────────────────────────────────────────
export async function getMenuById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT id, paciente_id AS "pacienteId", nombre,
              TO_CHAR(semana_inicio, 'YYYY-MM-DD') AS "semanaInicio",
              ${columnasMenu.join(', ')},
              notas, created_at AS "createdAt"
       FROM menus_semanales
       WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menú no encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('getMenuById:', err.message)
    res.status(500).json({ error: 'Error al obtener el menú' })
  }
}

// ─── POST /api/menus ───────────────────────────────────────────────────────
export async function createMenu(req, res) {
  const { pacienteId, nombre, semanaInicio, notas = '', ...diasData } = req.body

  if (!pacienteId || !nombre || !semanaInicio) {
    return res.status(400).json({ error: 'pacienteId, nombre y semanaInicio son obligatorios' })
  }

  try {
    const newId = await generarIdUnico('menus_semanales')
    const valores = columnasMenu.map(col => diasData[col] || null)

    const result = await pool.query(
      `INSERT INTO menus_semanales (id, paciente_id, nombre, semana_inicio, ${columnasMenu.join(', ')}, notas)
       VALUES ($1, $2, $3, $4, ${columnasMenu.map((_, i) => `$${i + 5}`).join(', ')}, $${columnasMenu.length + 5})
       RETURNING id, paciente_id AS "pacienteId", nombre,
                 TO_CHAR(semana_inicio, 'YYYY-MM-DD') AS "semanaInicio",
                 ${columnasMenu.join(', ')}, notas, created_at AS "createdAt"`,
      [newId, pacienteId, nombre, semanaInicio, ...valores, notas]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createMenu:', err.message)
    res.status(500).json({ error: 'Error al crear el menú semanal' })
  }
}

// ─── PUT /api/menus/:id ────────────────────────────────────────────────────
export async function updateMenu(req, res) {
  const { id } = req.params
  const { nombre, semanaInicio, notas, ...diasData } = req.body

  try {
    const setClauses = []
    const valores = []
    let idx = 1

    if (nombre) { setClauses.push(`nombre = $${idx++}`); valores.push(nombre) }
    if (semanaInicio) { setClauses.push(`semana_inicio = $${idx++}`); valores.push(semanaInicio) }
    if (notas !== undefined) { setClauses.push(`notas = $${idx++}`); valores.push(notas) }

    columnasMenu.forEach(col => {
      if (diasData[col] !== undefined) {
        setClauses.push(`${col} = $${idx++}`)
        valores.push(diasData[col] || null)
      }
    })

    if (setClauses.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' })

    setClauses.push(`updated_at = NOW()`)
    valores.push(id)

    const result = await pool.query(
      `UPDATE menus_semanales SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id`,
      valores
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menú no encontrado' })
    res.json({ message: 'Menú actualizado correctamente', id: result.rows[0].id })
  } catch (err) {
    console.error('updateMenu:', err.message)
    res.status(500).json({ error: 'Error al actualizar el menú' })
  }
}

// ─── DELETE /api/menus/:id ─────────────────────────────────────────────────
export async function deleteMenu(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM menus_semanales WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menú no encontrado' })
    res.json({ message: 'Menú eliminado correctamente' })
  } catch (err) {
    console.error('deleteMenu:', err.message)
    res.status(500).json({ error: 'Error al eliminar el menú' })
  }
}
