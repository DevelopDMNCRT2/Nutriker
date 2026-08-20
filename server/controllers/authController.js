import pool from '../db/pool.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nutriker_secreto_super_seguro_2024'

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' })
  }

  try {
    // Buscar usuario por correo o nombre de usuario y que no esté eliminado
    const result = await pool.query(
      `SELECT id, nombre, usuario, correo, contrasena, rol
       FROM usuarios
       WHERE (correo = $1 OR usuario = $1) AND deleted_at IS NULL`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const unUsuario = result.rows[0]

    let contrasenaValida = false

    // Si la contraseña almacenada empieza con $2 (formato estándar de bcrypt) lo validamos con la librería
    if (unUsuario.contrasena.startsWith('$2')) {
      contrasenaValida = await bcrypt.compare(password, unUsuario.contrasena)
    } else {
      // Si la base de datos sigue usando texto plano (fallback por la migración reciente)
      contrasenaValida = (password === unUsuario.contrasena)
    }

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Generar Token JWT
    const tokenPayload = {
      id: unUsuario.id,
      correo: unUsuario.correo,
      rol: unUsuario.rol,
      nombre: unUsuario.nombre
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '8h' // Expira en 8 horas
    })

    // Enviamos el token al frontend
    res.json({
      message: 'Autenticación exitosa',
      token,
      usuario: tokenPayload
    })

  } catch (error) {
    console.error('Error en /login:', error)
    res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

// ─── POST /api/auth/login-paciente ──────────────────────────────────────────
export async function loginPaciente(req, res) {
  const { email, password } = req.body

  if (!email) {
    return res.status(400).json({ error: 'El correo o teléfono es requerido' })
  }

  try {
    // Buscar paciente por correo, teléfono o ID activo
    const result = await pool.query(
      `SELECT id, nombre, correo, telefono, edad
       FROM pacientes
       WHERE (LOWER(correo) = LOWER($1) OR telefono = $1 OR id = $1) AND deleted_at IS NULL`,
      [email.trim()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Paciente no encontrado. Verifica tu correo o teléfono registrado.' })
    }

    const paciente = result.rows[0]

    // Generar Token JWT del paciente
    const tokenPayload = {
      id: paciente.id,
      nombre: paciente.nombre,
      correo: paciente.correo,
      telefono: paciente.telefono,
      rol: 'paciente'
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '7d'
    })

    res.json({
      message: 'Bienvenido al Portal del Paciente',
      token,
      paciente: tokenPayload
    })
  } catch (error) {
    console.error('Error en /login-paciente:', error)
    res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

