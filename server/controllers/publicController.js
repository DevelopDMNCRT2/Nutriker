import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

// 1. Obtener catálogo de productos públicos
export const getProductosPublicos = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.descripcion_detallada,
        p.precio,
        p.descuento,
        p.precio_final,
        p.stock,
        p.imagen_principal,
        p.galeria,
        c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.deleted_at IS NULL AND p.stock > 0
      ORDER BY p.nombre ASC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el catálogo de productos', detalle: error.message })
  }
}

// 2. Obtener zonas de envío públicas
export const getZonasEnvioPublicas = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, tipo_region, costo, tiempo_entrega
      FROM zonas_envio
      WHERE deleted_at IS NULL AND activa = TRUE
      ORDER BY costo ASC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener zonas de envío', detalle: error.message })
  }
}

// 3. Procesar checkout público del paciente
export const procesarCheckoutPublico = async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      paciente_nombre,
      paciente_email,
      paciente_telefono,
      direccion_entrega,
      ciudad,
      zona_envio_id,
      metodo_pago,
      items
    } = req.body

    if (!paciente_nombre || !direccion_entrega || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Datos incompletos. Se requiere nombre del paciente, dirección de entrega y al menos un producto en el carrito.' 
      })
    }

    await client.query('BEGIN')

    const total = items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
    const newOrdenId = await generarIdUnico('ordenes')

    const insertOrdenSQL = `
      INSERT INTO ordenes (
        id, paciente_nombre, paciente_email, paciente_telefono,
        total, direccion_entrega, ciudad, estado_orden, estado_envio,
        zona_envio_id, metodo_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pagado', 'En preparación', $8, $9)
      RETURNING *
    `
    const ordenValues = [
      newOrdenId, paciente_nombre, paciente_email || null, paciente_telefono || null,
      total, direccion_entrega, ciudad || 'Ciudad de México',
      zona_envio_id || null, metodo_pago || 'Tarjeta de Crédito/Débito'
    ]

    const { rows: ordenRows } = await client.query(insertOrdenSQL, ordenValues)
    const ordenCreada = ordenRows[0]

    for (const item of items) {
      const detalleId = await generarIdUnico('detalles_orden')
      const insertDetalleSQL = `
        INSERT INTO detalles_orden (
          id, orden_id, producto_id, producto_nombre, cantidad, precio_unitario
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `
      await client.query(insertDetalleSQL, [
        detalleId,
        newOrdenId,
        item.producto_id || null,
        item.producto_nombre,
        item.cantidad || 1,
        item.precio_unitario
      ])
    }

    await client.query('COMMIT')
    res.status(201).json({
      mensaje: 'Orden registrada y procesada exitosamente',
      orden: ordenCreada
    })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Error al procesar la compra', detalle: error.message })
  } finally {
    client.release()
  }
}

// 4. Agendar cita pública desde el portal paciente
export const agendarCitaPublica = async (req, res) => {
  try {
    const { 
      paciente_nombre, correo, paciente_telefono, fecha, horario, password
    } = req.body

    if (!paciente_nombre || !correo || !paciente_telefono || !fecha || !horario || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos obligatorios deben estar completos (nombre, correo, teléfono, contraseña, fecha y horario).' 
      })
    }

    // Verificar si el teléfono ya existe en alguna de las tablas
    const telefonoConflictoQuery = `
      SELECT id FROM citas WHERE paciente_telefono = $1 AND deleted_at IS NULL
      UNION
      SELECT id FROM citas_monex WHERE paciente_telefono = $1 AND deleted_at IS NULL
    `
    const telefonoConflicto = await pool.query(telefonoConflictoQuery, [paciente_telefono])
    
    if (telefonoConflicto.rows.length > 0) {
      return res.status(409).json({
        error: 'Este número de teléfono ya se encuentra registrado. Solo se permite un registro por paciente.',
        codigo: 'TELEFONO_DUPLICADO'
      })
    }

    // Verificar si el horario ya está ocupado para esa fecha
    const conflictoQuery = `
      SELECT id FROM citas
      WHERE fecha = $1 AND horario = $2 AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
      UNION
      SELECT id FROM citas_monex
      WHERE fecha = $1 AND horario = $2 AND deleted_at IS NULL AND COALESCE(estado, 'Confirmada') != 'Cancelada'
    `
    const conflicto = await pool.query(conflictoQuery, [fecha, horario])

    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        error: `Lo sentimos, el horario ${horario} del ${fecha} ya se encuentra reservado. Por favor selecciona otro horario.`,
        codigo: 'HORARIO_OCUPADO'
      })
    }

    const newId = await generarIdUnico('citas')

    const query = `
      INSERT INTO citas_monex (
        id, paciente_nombre, correo, paciente_telefono, fecha, horario, empresa, estado, password
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'Monex', 'Confirmada', $7)
      RETURNING *
    `
    const values = [
      newId, paciente_nombre, correo, paciente_telefono, fecha, horario, password
    ]

    const { rows } = await pool.query(query, values)
    res.status(201).json({
      mensaje: 'Cita agendada con éxito',
      cita: rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al agendar la cita', detalle: error.message })
  }
}

// 5. Login de Paciente
export const loginPaciente = async (req, res) => {
  try {
    const { identificador } = req.body
    if (!identificador || !identificador.trim()) {
      return res.status(400).json({ error: 'Por favor ingresa tu número de teléfono de 10 dígitos o correo electrónico.' })
    }

    const rawVal = identificador.trim()
    const cleanPhone = rawVal.replace(/\D/g, '')

    // 1. Buscar en la tabla pacientes
    const queryPacientes = `
      SELECT *
      FROM pacientes
      WHERE (telefono = $1 OR (length($2) = 10 AND REPLACE(telefono, '-', '') = $2) OR LOWER(correo) = LOWER($1)) AND deleted_at IS NULL
      LIMIT 1
    `
    const { rows: pacientesRows } = await pool.query(queryPacientes, [rawVal, cleanPhone])

    if (pacientesRows.length > 0) {
      return res.json({
        mensaje: 'Autenticación exitosa',
        paciente: pacientesRows[0]
      })
    }

    // 2. Si no está en pacientes, buscar en la tabla citas
    const queryCitas = `
      SELECT *, paciente_nombre AS nombre, paciente_telefono AS telefono
      FROM citas
      WHERE (paciente_telefono = $1 OR (length($2) = 10 AND REPLACE(paciente_telefono, '-', '') = $2) OR LOWER(correo) = LOWER($1)) AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `
    const { rows: citasRows } = await pool.query(queryCitas, [rawVal, cleanPhone])

    if (citasRows.length > 0) {
      return res.json({
        mensaje: 'Autenticación exitosa',
        paciente: citasRows[0]
      })
    }

    return res.status(404).json({
      error: 'No se encontró ningún expediente ni cita registrada con esos datos. Por favor agenda tu primera cita en la pestaña Agendar.'
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message })
  }
}

// 6. Portal del Paciente (Historial, Citas y Menú Semanal)
export const getPortalPaciente = async (req, res) => {
  try {
    const { paciente_id, telefono } = req.query
    if (!paciente_id && !telefono) {
      return res.status(400).json({ error: 'Se requiere el ID o teléfono del paciente' })
    }

    let pacienteRes
    if (paciente_id) {
      pacienteRes = await pool.query('SELECT * FROM pacientes WHERE id = $1 AND deleted_at IS NULL', [paciente_id])
    } else {
      pacienteRes = await pool.query('SELECT * FROM pacientes WHERE telefono = $1 AND deleted_at IS NULL', [telefono])
    }

    if (pacienteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Expediente de paciente no encontrado' })
    }

    const paciente = pacienteRes.rows[0]

    // Obtener menú semanal asignado al paciente
    const menuRes = await pool.query(`
      SELECT * FROM menus_semanales 
      WHERE paciente_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC LIMIT 1
    `, [paciente.id])

    // Obtener citas del paciente
    const citasRes = await pool.query(`
      SELECT * FROM citas 
      WHERE (paciente_telefono = $1 OR paciente_nombre = $2) AND deleted_at IS NULL
      ORDER BY fecha DESC, horario DESC
    `, [paciente.telefono, paciente.nombre])

    res.json({
      paciente,
      menuSemanal: menuRes.rows[0] || null,
      citas: citasRes.rows
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el portal del paciente', detalle: error.message })
  }
}
