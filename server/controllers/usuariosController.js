import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'
import bcrypt from 'bcrypt'

// GET /api/usuarios — Listar todos los usuarios activos (sin deleted_at)
export async function getUsuarios(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, usuario, correo, contrasena, rol,
              TO_CHAR(fecha_alta, 'YYYY-MM-DD') AS "fechaAlta",
              updated_at AS "updatedAt"
       FROM usuarios
       WHERE deleted_at IS NULL
       ORDER BY id ASC`
    )

    // Si el usuario no es Administrador, ocultamos la contraseña
    const usuarios = result.rows.map(u => {
      const { contrasena, ...resto } = u
      return req.usuario.rol === 'Administrador' ? u : resto
    })

    res.json(usuarios)
  } catch (err) {
    console.error('getUsuarios error:', err.message)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

// GET /api/usuarios/:id — Detalle de un usuario
export async function getUsuarioById(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT id, nombre, usuario, correo, contrasena, rol,
              TO_CHAR(fecha_alta, 'YYYY-MM-DD') AS "fechaAlta",
              updated_at AS "updatedAt"
       FROM usuarios
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const unUsuario = result.rows[0]
    if (req.usuario.rol !== 'Administrador') {
      delete unUsuario.contrasena
    }

    res.json(unUsuario)
  } catch (err) {
    console.error('getUsuarioById error:', err.message)
    res.status(500).json({ error: 'Error al obtener el usuario' })
  }
}

// POST /api/usuarios — Crear un nuevo usuario (Solo Admin)
export async function createUsuario(req, res) {
  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No tienes permisos para crear usuarios' })
  }
  const { nombre, usuario, correo, contrasena, rol } = req.body

  if (!nombre || !usuario || !correo || !contrasena || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }
  if (!['Administrador', 'Asistente', 'RRHH'].includes(rol)) {
    return res.status(400).json({ error: 'El rol debe ser Administrador, Asistente o RRHH' })
  }

  try {
    const newId = await generarIdUnico('usuarios')
    
    // Encriptar la contraseña
    const hashedPass = await bcrypt.hash(contrasena, 10)

    const result = await pool.query(
      `INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, usuario, correo, contrasena, rol,
                 TO_CHAR(fecha_alta, 'YYYY-MM-DD') AS "fechaAlta"`,
      [newId, nombre, usuario, correo, hashedPass, rol]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('createUsuario error:', err.message)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El usuario o correo ya existe' })
    }
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

// PUT /api/usuarios/:id — Editar un usuario (Solo Admin)
export async function updateUsuario(req, res) {
  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No tienes permisos para editar usuarios' })
  }
  const { id } = req.params
  const { nombre, usuario, correo, contrasena, rol } = req.body

  if (!nombre || !usuario || !correo || !rol) {
    return res.status(400).json({ error: 'Nombre, usuario, correo y rol son obligatorios' })
  }
  if (!['Administrador', 'Asistente', 'RRHH'].includes(rol)) {
    return res.status(400).json({ error: 'El rol debe ser Administrador, Asistente o RRHH' })
  }

  try {
    // Si se manda contraseña, actualizarla; si no, dejarla igual
    let queryText
    let queryParams

    if (contrasena && contrasena.trim() !== '') {
      const hashedPass = await bcrypt.hash(contrasena, 10)
      queryText = `UPDATE usuarios
                   SET nombre=$1, usuario=$2, correo=$3, contrasena=$4, rol=$5, updated_at=NOW()
                   WHERE id=$6 AND deleted_at IS NULL
                   RETURNING id, nombre, usuario, correo, contrasena, rol,
                             TO_CHAR(fecha_alta, 'YYYY-MM-DD') AS "fechaAlta"`
      queryParams = [nombre, usuario, correo, hashedPass, rol, id]
    } else {
      queryText = `UPDATE usuarios
                   SET nombre=$1, usuario=$2, correo=$3, rol=$4, updated_at=NOW()
                   WHERE id=$5 AND deleted_at IS NULL
                   RETURNING id, nombre, usuario, correo, contrasena, rol,
                             TO_CHAR(fecha_alta, 'YYYY-MM-DD') AS "fechaAlta"`
      queryParams = [nombre, usuario, correo, rol, id]
    }

    const result = await pool.query(queryText, queryParams)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('updateUsuario error:', err.message)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El usuario o correo ya existe en otro registro' })
    }
    res.status(500).json({ error: 'Error al actualizar el usuario' })
  }
}

// DELETE /api/usuarios/:id — Soft delete (Solo Admin)
export async function deleteUsuario(req, res) {
  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios' })
  }
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE usuarios SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json({ message: 'Usuario eliminado correctamente', id: result.rows[0].id })
  } catch (err) {
    console.error('deleteUsuario error:', err.message)
    res.status(500).json({ error: 'Error al eliminar el usuario' })
  }
}
