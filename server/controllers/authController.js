import pool from '../db/pool.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generarIdUnico } from '../utils/generarId.js'

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

  if (!email || !password) {
    return res.status(400).json({ error: 'El identificador y la contraseña son requeridos' })
  }

  try {
    const rawVal = email.trim()
    const cleanPhone = rawVal.replace(/\D/g, '')

    // 1. Buscar primero en la tabla pacientes (clínica general)
    const result = await pool.query(
      `SELECT id, nombre, correo, telefono, edad, contrasena
       FROM pacientes
       WHERE (LOWER(correo) = LOWER($1) OR telefono = $1 OR (length($2) = 10 AND REPLACE(telefono, '-', '') = $2) OR id::text = $1) AND deleted_at IS NULL
       LIMIT 1`,
      [rawVal, cleanPhone]
    )

    let paciente = null
    let esMonex = false

    if (result.rows.length > 0) {
      paciente = result.rows[0]
    } else {
      // 2. Si no está en pacientes, buscar en citas_monex (empleados/pacientes Monex)
      const monexResult = await pool.query(
        `SELECT id, paciente_nombre AS nombre, correo, paciente_telefono AS telefono, password AS contrasena, empresa, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, horario
         FROM citas_monex
         WHERE (LOWER(correo) = LOWER($1) OR paciente_telefono = $1 OR (length($2) = 10 AND REPLACE(paciente_telefono, '-', '') = $2)) AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [rawVal, cleanPhone]
      )

      if (monexResult.rows.length > 0) {
        const monexRow = monexResult.rows[0]
        esMonex = true

        // Validar contraseña contra citas_monex
        let passValida = false
        if (monexRow.contrasena && monexRow.contrasena.startsWith('$2')) {
          passValida = await bcrypt.compare(password, monexRow.contrasena)
        } else if (monexRow.contrasena) {
          passValida = (password === monexRow.contrasena)
        }

        if (!passValida) {
          return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu contraseña.' })
        }

        // Sincronizar o crear ficha en tabla pacientes para que el portal interactivo y consultas funcionen
        const pacienteExistente = await pool.query(
          `SELECT id, nombre, correo, telefono, edad
           FROM pacientes
           WHERE (LOWER(correo) = LOWER($1) OR telefono = $2) AND deleted_at IS NULL
           LIMIT 1`,
          [monexRow.correo, monexRow.telefono]
        )

        if (pacienteExistente.rows.length > 0) {
          paciente = pacienteExistente.rows[0]
        } else {
          const newPacienteId = await generarIdUnico('pacientes')
          const hashedPass = monexRow.contrasena && monexRow.contrasena.startsWith('$2')
            ? monexRow.contrasena
            : await bcrypt.hash(password, 10)

          const insertResult = await pool.query(
            `INSERT INTO pacientes (id, cita_id, nombre, correo, telefono, fecha, horario, contrasena, notas)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, nombre, correo, telefono, edad`,
            [
              newPacienteId,
              null, // cita_id es null porque la cita de origen pertenece a citas_monex
              monexRow.nombre,
              monexRow.correo,
              monexRow.telefono,
              monexRow.fecha,
              monexRow.horario,
              hashedPass,
              `Paciente registrado vía portal corporativo Monex (Cita Monex #${monexRow.id})`
            ]
          )
          paciente = insertResult.rows[0]
        }
      }
    }

    if (!paciente) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu información o agenda tu primera cita.' })
    }

    // Si el registro provino directamente de la tabla pacientes, validar su contraseña
    if (!esMonex) {
      let contrasenaValida = false
      if (paciente.contrasena && paciente.contrasena.startsWith('$2')) {
        contrasenaValida = await bcrypt.compare(password, paciente.contrasena)
      } else if (paciente.contrasena) {
        contrasenaValida = (password === paciente.contrasena)
      }

      if (!contrasenaValida) {
        return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu contraseña.' })
      }
    }

    // Generar Token JWT del paciente
    const tokenPayload = {
      id: paciente.id,
      nombre: paciente.nombre,
      correo: paciente.correo,
      telefono: paciente.telefono,
      rol: 'paciente',
      ...(esMonex ? { empresa: 'Monex' } : {})
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

// ─── POST /api/auth/recuperar-info ─────────────────────────────────────────
export async function recuperarInfo(req, res) {
  const { telefono } = req.body
  if (!telefono) return res.status(400).json({ error: 'El teléfono es requerido' })

  try {
    let result = await pool.query(
      `SELECT id, correo FROM pacientes WHERE telefono = $1 AND deleted_at IS NULL`,
      [telefono.trim()]
    )

    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, correo FROM citas_monex WHERE paciente_telefono = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
        [telefono.trim()]
      )
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún paciente con este teléfono' })
    }

    const { correo } = result.rows[0]
    if (!correo) {
      return res.status(400).json({ error: 'Este paciente no tiene correo registrado. Contacta a la clínica.' })
    }

    // Censurar el correo: d***a@gmail.com
    const [name, domain] = correo.split('@')
    let maskedName = name
    if (name.length > 2) {
      maskedName = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    } else {
      maskedName = name[0] + '*'
    }
    const maskedEmail = `${maskedName}@${domain}`

    res.json({ maskedEmail })
  } catch (error) {
    console.error('Error en recuperar-info:', error)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

// ─── POST /api/auth/enviar-link ─────────────────────────────────────────────
export async function enviarLinkRecuperacion(req, res) {
  const { telefono, correoConfirmacion } = req.body

  try {
    let result = await pool.query(
      `SELECT id, correo, nombre FROM pacientes WHERE telefono = $1 AND deleted_at IS NULL`,
      [telefono.trim()]
    )

    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, correo, paciente_nombre AS nombre FROM citas_monex WHERE paciente_telefono = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
        [telefono.trim()]
      )
    }

    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' })

    const paciente = result.rows[0]

    if (paciente.correo.toLowerCase() !== correoConfirmacion.trim().toLowerCase()) {
      return res.status(400).json({ error: 'El correo no coincide con el registrado en el expediente' })
    }

    // Generar Token de Recuperación
    const tokenPayload = { id: paciente.id, type: 'password_reset' }
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' })

    const link = `http://localhost:5174/crear-password?token=${token}`

    // SIMULACIÓN (Opción B)
    console.log('\n=============================================')
    console.log(`📧 SIMULACIÓN DE CORREO ENVIADO A: ${paciente.correo}`)
    console.log(`Asunto: Recuperación de Contraseña - NutriKer`)
    console.log(`Hola ${paciente.nombre}, haz clic en el siguiente enlace para crear una nueva contraseña:`)
    console.log(link)
    console.log('=============================================\n')

    res.json({ message: 'Si el correo es correcto, te hemos enviado un enlace de recuperación.' })
  } catch (error) {
    console.error('Error en enviar-link:', error)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

// ─── POST /api/auth/reset-password ──────────────────────────────────────────
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body

  if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.type !== 'password_reset' && decoded.type !== 'password_create') {
      return res.status(400).json({ error: 'Token inválido' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(newPassword, salt)

    await pool.query(
      `UPDATE pacientes SET contrasena = $1 WHERE id = $2`,
      [hashedPass, decoded.id]
    )

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error en reset-password:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' })
    }
    res.status(400).json({ error: 'Enlace inválido o corrupto.' })
  }
}
