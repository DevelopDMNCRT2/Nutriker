import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

export const getOrdenes = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.*,
        z.nombre AS zona_nombre,
        z.tipo_region AS zona_region,
        z.costo AS zona_costo,
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'producto_id', d.producto_id,
              'producto_nombre', d.producto_nombre,
              'cantidad', d.cantidad,
              'precio_unitario', d.precio_unitario,
              'subtotal', (d.cantidad * d.precio_unitario)
            )
          ) FILTER (WHERE d.id IS NOT NULL), '[]'::json
        ) AS items
      FROM ordenes o
      LEFT JOIN zonas_envio z ON o.zona_envio_id = z.id
      LEFT JOIN detalles_orden d ON o.id = d.orden_id
      WHERE o.deleted_at IS NULL
      GROUP BY o.id, z.id
      ORDER BY o.created_at DESC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes de compra', detalle: error.message })
  }
}

export const getOrdenById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT 
        o.*,
        z.nombre AS zona_nombre,
        z.tipo_region AS zona_region,
        z.costo AS zona_costo,
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'producto_id', d.producto_id,
              'producto_nombre', d.producto_nombre,
              'cantidad', d.cantidad,
              'precio_unitario', d.precio_unitario,
              'subtotal', (d.cantidad * d.precio_unitario)
            )
          ) FILTER (WHERE d.id IS NOT NULL), '[]'::json
        ) AS items
      FROM ordenes o
      LEFT JOIN zonas_envio z ON o.zona_envio_id = z.id
      LEFT JOIN detalles_orden d ON o.id = d.orden_id
      WHERE o.id = $1 AND o.deleted_at IS NULL
      GROUP BY o.id, z.id
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la orden', detalle: error.message })
  }
}

export const createOrden = async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      direccion_entrega,
      ciudad,
      zona_envio_id,
      metodo_pago,
      items // Array de { producto_id, producto_nombre, cantidad, precio_unitario }
    } = req.body

    if (!cliente_nombre || !direccion_entrega || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El nombre del cliente, dirección e ítems de compra son obligatorios.' })
    }

    await client.query('BEGIN')

    // Calcular total
    const total = items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
    const newOrdenId = await generarIdUnico('ordenes')

    const insertOrdenSQL = `
      INSERT INTO ordenes (
        id, cliente_nombre, cliente_email, cliente_telefono,
        total, direccion_entrega, ciudad, estado_orden, estado_envio,
        zona_envio_id, metodo_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pagado', 'En preparación', $8, $9)
      RETURNING *
    `
    const ordenValues = [
      newOrdenId, cliente_nombre, cliente_email || null, cliente_telefono || null,
      total, direccion_entrega, ciudad || 'Ciudad de México',
      zona_envio_id || null, metodo_pago || 'Tarjeta de Crédito/Débito'
    ]

    const { rows: ordenRows } = await client.query(insertOrdenSQL, ordenValues)
    const ordenCreada = ordenRows[0]

    // Insertar detalles de orden
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
    res.status(201).json(ordenCreada)
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Error al registrar la orden', detalle: error.message })
  } finally {
    client.release()
  }
}

export const updateEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_orden } = req.body

    const estadosValidos = ['Pendiente', 'Pagado', 'Rechazado', 'Completado', 'Cancelado']
    if (!estado_orden || !estadosValidos.includes(estado_orden)) {
      return res.status(400).json({ error: 'Estado de orden no válido.' })
    }

    const query = `
      UPDATE ordenes
      SET estado_orden = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `
    const { rows } = await pool.query(query, [estado_orden, id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }

    // Inyección automática en Tesorería al marcar la orden como Pagado o Completado
    if (['Pagado', 'Completado'].includes(estado_orden)) {
      const orden = rows[0]
      const checkIngreso = await pool.query('SELECT id FROM ingresos WHERE concepto LIKE $1 AND deleted_at IS NULL', [`%Orden #${orden.id}%`])
      if (checkIngreso.rows.length === 0) {
        const ingId = await generarIdUnico('ingresos')
        await pool.query(
          `INSERT INTO ingresos (id, fecha, concepto, a_nombre_de, recibe, cantidad, metodo_pago, notas)
           VALUES ($1, CURRENT_DATE, $2, $3, 'Dra. Alexa Lora', $4, 'Tarjeta / En línea', $5)`,
          [ingId, `Venta en línea - Orden #${orden.id}`, orden.cliente_nombre || 'Cliente Tienda', orden.total || 0, `Generado automáticamente por la Orden #${orden.id}`]
        )
      }
    }

    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado de pago de la orden', detalle: error.message })
  }
}

export const updateEstadoEnvio = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_envio, zona_envio_id } = req.body

    const enviosValidos = ['En preparación', 'En camino', 'Entregado', 'Devuelto']
    if (!estado_envio || !enviosValidos.includes(estado_envio)) {
      return res.status(400).json({ error: 'Estado de envío no válido.' })
    }

    const query = `
      UPDATE ordenes
      SET estado_envio = $1,
          zona_envio_id = COALESCE($2, zona_envio_id),
          updated_at = NOW()
      WHERE id = $3 AND deleted_at IS NULL
      RETURNING *
    `
    const { rows } = await pool.query(query, [estado_envio, zona_envio_id || null, id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado del envío', detalle: error.message })
  }
}

export const deleteOrden = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      UPDATE ordenes
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }
    res.json({ message: 'Orden eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la orden', detalle: error.message })
  }
}
