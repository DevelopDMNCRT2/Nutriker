import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

/**
 * Obtener menú semanal B2B (3FN)
 * GET /api/royal/menu/actual?semana=2026-08-10&empresa=Royal%20Canin
 */
export async function obtenerMenuSemana(req, res) {
  const { semana, empresa = 'Royal Canin' } = req.query

  try {
    let query = 'SELECT * FROM menus_b2b WHERE empresa = $1'
    const params = [empresa]

    if (semana) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(semana)) {
        query += ' AND semana_key = $2'
        params.push(semana)
      } else if (!isNaN(parseInt(semana, 10))) {
        query += ' AND semana_numero = $2'
        params.push(parseInt(semana, 10))
      }
    } else {
      query += ' ORDER BY semana_key DESC LIMIT 1'
    }

    const menuRes = await pool.query(query, params)

    if (menuRes.rowCount === 0) {
      return res.json({
        isPublished: false,
        weekKey: semana || null,
        days: []
      })
    }

    const menu = menuRes.rows[0]

    // Consultar platillos normalizados por día y opción en 3FN
    const diasRes = await pool.query(
      `SELECT * FROM menu_b2b_dias 
       WHERE menu_id = $1 
       ORDER BY fecha ASC, tipo_opcion ASC`,
      [menu.id]
    )

    // Agrupar por día para entregar el formato esperado por el frontend
    const diasMap = {}
    diasRes.rows.forEach(row => {
      if (!diasMap[row.dia_semana]) {
        diasMap[row.dia_semana] = {
          dayName: row.dia_semana,
          dateLabel: `${row.dia_semana}, ${new Date(row.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`,
          optionA: null,
          optionB: null
        }
      }

      const optData = {
        id: row.id,
        name: row.nombre_platillo,
        category: row.categoria,
        calories: row.calorias,
        protein: `${row.proteinas_g}g`,
        carbs: `${row.carbohidratos_g}g`,
        fats: `${row.grasas_g}g`,
        image: row.imagen_url,
        recipe: {
          ingredients: row.ingredientes || '',
          method: row.metodo_preparacion || ''
        }
      }

      if (row.tipo_opcion === 'A') {
        diasMap[row.dia_semana].optionA = optData
      } else {
        diasMap[row.dia_semana].optionB = optData
      }
    })

    const days = Object.values(diasMap)

    return res.json({
      id: menu.id,
      weekKey: menu.semana_key,
      weekNumber: menu.semana_numero,
      empresa: menu.empresa,
      daysPerWeek: String(menu.dias_servicio),
      dietOptionA: menu.titulo_opcion_a,
      dietOptionB: menu.titulo_opcion_b,
      publishedAt: menu.publicado_en,
      isPublished: menu.publicado,
      days
    })
  } catch (error) {
    console.error('❌ Error al obtener menú B2B:', error)
    return res.status(500).json({ error: 'Error interno al consultar el menú semanal B2B' })
  }
}

/**
 * Publicar o actualizar menú semanal B2B (3FN)
 * POST /api/royal/menu
 */
export async function guardarMenuSemana(req, res) {
  const {
    empresa = 'Royal Canin',
    weekKey,
    weekNumber,
    daysPerWeek = 5,
    dietOptionA = 'Balance Proteico',
    dietOptionB = 'Plant-Based & Digestión Ligera',
    days = [],
    nutriologaId = null
  } = req.body

  if (!weekKey || !Array.isArray(days)) {
    return res.status(400).json({ error: 'Parámetros incompletos: se requiere weekKey y array de days' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const fechaInicio = new Date(`${weekKey}T12:00:00Z`)
    const fechaFin = new Date(fechaInicio.getTime() + 4 * 86400000)

    // 1. Verificar si ya existe menú para esa empresa y semana
    const existingMenu = await client.query(
      'SELECT id FROM menus_b2b WHERE empresa = $1 AND semana_key = $2',
      [empresa, weekKey]
    )

    let menuId
    if (existingMenu.rowCount > 0) {
      menuId = existingMenu.rows[0].id
      await client.query(
        `UPDATE menus_b2b 
         SET dias_servicio = $1, titulo_opcion_a = $2, titulo_opcion_b = $3, 
             publicado = TRUE, publicado_en = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [parseInt(daysPerWeek, 10) || 5, dietOptionA, dietOptionB, menuId]
      )

      // Eliminar registros anteriores para recreación limpia atómica
      await client.query('DELETE FROM menu_b2b_dias WHERE menu_id = $1', [menuId])
    } else {
      menuId = await generarIdUnico('menus_b2b')
      await client.query(
        `INSERT INTO menus_b2b (
          id, empresa, semana_key, semana_numero, fecha_inicio, fecha_fin, 
          dias_servicio, titulo_opcion_a, titulo_opcion_b, publicado, nutriologa_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10)`,
        [
          menuId,
          empresa,
          weekKey,
          parseInt(weekNumber, 10) || 1,
          fechaInicio,
          fechaFin,
          parseInt(daysPerWeek, 10) || 5,
          dietOptionA,
          dietOptionB,
          nutriologaId
        ]
      )
    }

    // 2. Insertar cada día y opción atómicamente en menu_b2b_dias
    const dayOffsets = {
      'Lunes': 0,
      'Martes': 1,
      'Miércoles': 2,
      'Jueves': 3,
      'Viernes': 4
    }

    for (const d of days) {
      const dayName = d.dayName || 'Lunes'
      const offset = dayOffsets[dayName] ?? 0
      const diaFecha = new Date(fechaInicio.getTime() + offset * 86400000)

      // Opción A
      if (d.optionA) {
        const diaIdA = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.optionA.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.optionA.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.optionA.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url
          ) VALUES ($1, $2, $3, $4, 'A', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            diaIdA,
            menuId,
            dayName,
            diaFecha,
            d.optionA.name || 'Opción A',
            d.optionA.category || dietOptionA,
            parseInt(d.optionA.calories, 10) || 450,
            proteinNum,
            carbsNum,
            fatsNum,
            d.optionA.recipe?.ingredients || '',
            d.optionA.recipe?.method || '',
            d.optionA.image || null
          ]
        )
      }

      // Opción B
      if (d.optionB) {
        const diaIdB = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.optionB.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.optionB.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.optionB.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url
          ) VALUES ($1, $2, $3, $4, 'B', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            diaIdB,
            menuId,
            dayName,
            diaFecha,
            d.optionB.name || 'Opción B',
            d.optionB.category || dietOptionB,
            parseInt(d.optionB.calories, 10) || 400,
            proteinNum,
            carbsNum,
            fatsNum,
            d.optionB.recipe?.ingredients || '',
            d.optionB.recipe?.method || '',
            d.optionB.image || null
          ]
        )
      }
    }

    await client.query('COMMIT')
    return res.status(201).json({
      success: true,
      message: 'Menú semanal B2B publicado y guardado exitosamente en base de datos',
      menuId,
      weekKey
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al guardar menú B2B:', error)
    return res.status(500).json({ error: 'Error interno al guardar el menú en base de datos' })
  } finally {
    client.release()
  }
}

/**
 * Obtener pedidos y métricas de producción B2B (3FN)
 * GET /api/royal/pedidos/:semana?empresa=Royal%20Canin
 */
export async function obtenerPedidosSemana(req, res) {
  const { semana } = req.params
  const { empresa = 'Royal Canin' } = req.query

  try {
    // Buscar pedidos para la semana
    const pedidosRes = await pool.query(
      `SELECT p.id AS pedido_id, p.usuario_id, p.semana_key, p.estado, p.updated_at,
              COALESCE(u.nombre, ue.nombre, p.usuario_id) AS empleado_nombre
       FROM pedidos_b2b p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN usuarios_empresas ue ON ue.id = p.usuario_id
       WHERE p.empresa = $1 AND p.semana_key = $2`,
      [empresa, semana]
    )

    const ordersMap = {}
    const countsPerDay = {
      0: { A: 0, B: 0 },
      1: { A: 0, B: 0 },
      2: { A: 0, B: 0 },
      3: { A: 0, B: 0 },
      4: { A: 0, B: 0 }
    }
    const dayIndices = {
      'Lunes': 0,
      'Martes': 1,
      'Miércoles': 2,
      'Jueves': 3,
      'Viernes': 4
    }

    for (const ped of pedidosRes.rows) {
      const detallesRes = await pool.query(
        `SELECT * FROM pedido_b2b_detalles WHERE pedido_id = $1`,
        [ped.pedido_id]
      )

      const selections = {}
      detallesRes.rows.forEach(det => {
        const idx = dayIndices[det.dia_semana] ?? 0
        selections[idx] = {
          platoFuerte: det.opcion_seleccionada,
          diaSemana: det.dia_semana,
          notas: det.notas_adicionales
        }

        if (countsPerDay[idx]) {
          if (det.opcion_seleccionada === 'A') countsPerDay[idx].A++
          if (det.opcion_seleccionada === 'B') countsPerDay[idx].B++
        }
      })

      ordersMap[ped.usuario_id] = {
        id: ped.pedido_id,
        usuarioId: ped.usuario_id,
        empleadoNombre: ped.empleado_nombre,
        semanaKey: ped.semana_key,
        estado: ped.estado,
        updatedAt: ped.updated_at,
        selections
      }
    }

    return res.json({
      success: true,
      semanaKey: semana,
      orders: ordersMap,
      metrics: countsPerDay,
      totalOrders: pedidosRes.rowCount
    })
  } catch (error) {
    console.error('❌ Error al consultar pedidos B2B:', error)
    return res.status(500).json({ error: 'Error interno al consultar pedidos de la semana' })
  }
}

/**
 * Guardar pedido de empleado B2B (3FN)
 * POST /api/royal/pedidos
 */
export async function guardarPedidoEmpleado(req, res) {
  const {
    empresa = 'Royal Canin',
    usuarioId,
    semanaKey,
    selections = {},
    estado = 'confirmado'
  } = req.body

  if (!usuarioId || !semanaKey) {
    return res.status(400).json({ error: 'Parámetros incompletos: se requiere usuarioId y semanaKey' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Obtener el ID del menú para esa semana
    const menuRes = await client.query(
      'SELECT id FROM menus_b2b WHERE empresa = $1 AND semana_key = $2',
      [empresa, semanaKey]
    )

    let menuId
    if (menuRes.rowCount > 0) {
      menuId = menuRes.rows[0].id
    } else {
      // Si aún no está publicado formalmente, crear cabecera provisional
      menuId = await generarIdUnico('menus_b2b')
      const fechaInicio = new Date(`${semanaKey}T12:00:00Z`)
      const fechaFin = new Date(fechaInicio.getTime() + 4 * 86400000)
      await client.query(
        `INSERT INTO menus_b2b (id, empresa, semana_key, semana_numero, fecha_inicio, fecha_fin, dias_servicio, publicado)
         VALUES ($1, $2, $3, 1, $4, $5, 5, FALSE)`,
        [menuId, empresa, semanaKey, fechaInicio, fechaFin]
      )
    }

    // 2. Insertar o actualizar pedidos_b2b
    let pedidoId
    const existingPedido = await client.query(
      'SELECT id FROM pedidos_b2b WHERE usuario_id = $1 AND semana_key = $2',
      [usuarioId, semanaKey]
    )

    if (existingPedido.rowCount > 0) {
      pedidoId = existingPedido.rows[0].id
      await client.query(
        `UPDATE pedidos_b2b 
         SET estado = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [estado, pedidoId]
      )
      await client.query('DELETE FROM pedido_b2b_detalles WHERE pedido_id = $1', [pedidoId])
    } else {
      pedidoId = await generarIdUnico('pedidos_b2b')
      await client.query(
        `INSERT INTO pedidos_b2b (id, empresa, usuario_id, menu_id, semana_key, estado)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pedidoId, empresa, usuarioId, menuId, semanaKey, estado]
      )
    }

    // 3. Insertar selecciones en pedido_b2b_detalles
    const daysArr = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    for (const [key, val] of Object.entries(selections)) {
      const diaSemana = daysArr[parseInt(key, 10)] || key
      const opcion = (val.platoFuerte || val.opcion || 'A').toUpperCase()

      // Buscar si existe el platillo en menu_b2b_dias
      const diaRes = await client.query(
        `SELECT id FROM menu_b2b_dias 
         WHERE menu_id = $1 AND dia_semana = $2 AND tipo_opcion = $3`,
        [menuId, diaSemana, opcion]
      )
      const menuDiaId = diaRes.rowCount > 0 ? diaRes.rows[0].id : null

      const detalleId = await generarIdUnico('pedido_b2b_detalles')
      await client.query(
        `INSERT INTO pedido_b2b_detalles (
          id, pedido_id, menu_dia_id, dia_semana, opcion_seleccionada, notas_adicionales
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [detalleId, pedidoId, menuDiaId, diaSemana, opcion, val.notas || null]
      )
    }

    await client.query('COMMIT')
    return res.status(201).json({
      success: true,
      message: 'Pedido B2B registrado exitosamente en base de datos',
      pedidoId,
      usuarioId,
      semanaKey
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al guardar pedido B2B:', error)
    return res.status(500).json({ error: 'Error interno al guardar pedido del empleado' })
  } finally {
    client.release()
  }
}
