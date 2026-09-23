import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'
import { enviarConfirmacionPedidoB2B } from '../services/notificationService.js'
import { calcularMacrosIA } from './iaController.js'

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
    for (const row of diasRes.rows) {
      if (!diasMap[row.dia_semana]) {
        diasMap[row.dia_semana] = {
          dayName: row.dia_semana,
          dateLabel: new Date(row.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
          soup: null,
          optionA: null,
          optionB: null,
          optionC: null
        }
      }

      let clinicalProfile = row.perfil_clinico || null
      let rawAllergens = row.alergenos
      let allergens = Array.isArray(rawAllergens) ? rawAllergens : (typeof rawAllergens === 'string' ? JSON.parse(rawAllergens || '[]') : [])
      let calories = row.calorias
      let protein = `${row.proteinas_g}g`
      let carbs = `${row.carbohidratos_g}g`
      let fats = `${row.grasas_g}g`

      // Auto-enriquecer con el nodo de IA si no tiene perfil clínico o tiene macros mock genéricos
      const needsEnrichment = !clinicalProfile || (calories === 480 && protein === '35.00g') || (calories === 430 && protein === '18.00g')
      if (needsEnrichment && (row.nombre_platillo || row.ingredientes)) {
        try {
          const aiData = await calcularMacrosIA({
            nombrePlatillo: row.nombre_platillo,
            ingredientes: row.ingredientes,
            categoria: row.categoria
          })
          if (aiData) {
            clinicalProfile = aiData.perfilClinico
            allergens = aiData.alergenos
            calories = aiData.calorias
            protein = aiData.proteina
            carbs = aiData.carbos
            fats = aiData.grasas

            const protNum = parseFloat(String(protein).replace('g', '')) || 0
            const carbNum = parseFloat(String(carbs).replace('g', '')) || 0
            const fatNum = parseFloat(String(fats).replace('g', '')) || 0

            pool.query(
              `UPDATE menu_b2b_dias 
               SET calorias = $1, proteinas_g = $2, carbohidratos_g = $3, grasas_g = $4, perfil_clinico = $5, alergenos = $6 
               WHERE id = $7`,
              [calories, protNum, carbNum, fatNum, clinicalProfile, JSON.stringify(allergens), row.id]
            ).catch(() => {})
          }
        } catch (_) {}
      }

      const optData = {
        id: row.id,
        name: row.nombre_platillo,
        category: row.categoria,
        calories,
        protein,
        carbs,
        fats,
        clinicalProfile,
        allergens,
        image: row.imagen_url,
        recipe: {
          ingredients: row.ingredientes || '',
          method: row.metodo_preparacion || ''
        }
      }

      if (row.tipo_opcion === 'S') {
        diasMap[row.dia_semana].soup = optData
      } else if (row.tipo_opcion === 'A') {
        diasMap[row.dia_semana].optionA = optData
      } else if (row.tipo_opcion === 'B') {
        diasMap[row.dia_semana].optionB = optData
      } else if (row.tipo_opcion === 'C') {
        diasMap[row.dia_semana].optionC = optData
      }
    }

    const days = Object.values(diasMap)

    return res.json({
      id: menu.id,
      weekKey: menu.semana_key,
      weekNumber: menu.semana_numero,
      empresa: menu.empresa,
      daysPerWeek: String(menu.dias_servicio),
      dietOptionA: menu.titulo_opcion_a,
      dietOptionB: menu.titulo_opcion_b,
      dietOptionC: menu.titulo_opcion_c || 'Especial & Hiposódico',
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
    dietOptionC = 'Especial & Hiposódico',
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
         SET dias_servicio = $1, titulo_opcion_a = $2, titulo_opcion_b = $3, titulo_opcion_c = $4,
             publicado = TRUE, publicado_en = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [parseInt(daysPerWeek, 10) || 5, dietOptionA, dietOptionB, dietOptionC, menuId]
      )

      // Eliminar registros anteriores para recreación limpia atómica
      await client.query('DELETE FROM menu_b2b_dias WHERE menu_id = $1', [menuId])
    } else {
      menuId = await generarIdUnico('menus_b2b')
      await client.query(
        `INSERT INTO menus_b2b (
          id, empresa, semana_key, semana_numero, fecha_inicio, fecha_fin, 
          dias_servicio, titulo_opcion_a, titulo_opcion_b, titulo_opcion_c, publicado, nutriologa_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11)`,
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
          dietOptionC,
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
      'Viernes': 4,
      'Sábado': 5,
      'Domingo': 6
    }

    for (const d of days) {
      const dayName = d.dayName || 'Lunes'
      const offset = dayOffsets[dayName] ?? 0
      const diaFecha = new Date(fechaInicio.getTime() + offset * 86400000)

      // Sopa (Enfoque 1: 'S')
      if (d.soup) {
        const diaIdS = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.soup.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.soup.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.soup.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url
          ) VALUES ($1, $2, $3, $4, 'S', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            diaIdS,
            menuId,
            dayName,
            diaFecha,
            d.soup.name || 'Sopa Nutritiva',
            'Sopa',
            parseInt(d.soup.calories, 10) || 220,
            proteinNum,
            carbsNum,
            fatsNum,
            d.soup.recipe?.ingredients || '',
            d.soup.recipe?.method || '',
            d.soup.image || null
          ]
        )
      }

      // Opción A ('A')
      if (d.optionA) {
        const diaIdA = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.optionA.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.optionA.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.optionA.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url, perfil_clinico, alergenos
          ) VALUES ($1, $2, $3, $4, 'A', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            diaIdA,
            menuId,
            dayName,
            diaFecha,
            d.optionA.name || 'Opción A',
            d.optionA.category || dietOptionA,
            parseInt(d.optionA.calories, 10) || 480,
            proteinNum,
            carbsNum,
            fatsNum,
            d.optionA.recipe?.ingredients || '',
            d.optionA.recipe?.method || '',
            d.optionA.image || null,
            d.optionA.clinicalProfile || null,
            JSON.stringify(d.optionA.allergens || [])
          ]
        )
      }

      // Opción B ('B')
      if (d.optionB) {
        const diaIdB = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.optionB.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.optionB.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.optionB.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url, perfil_clinico, alergenos
          ) VALUES ($1, $2, $3, $4, 'B', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            diaIdB,
            menuId,
            dayName,
            diaFecha,
            d.optionB.name || 'Opción B',
            d.optionB.category || dietOptionB,
            parseInt(d.optionB.calories, 10) || 430,
            proteinNum,
            carbsNum,
            fatsNum,
            d.optionB.recipe?.ingredients || '',
            d.optionB.recipe?.method || '',
            d.optionB.image || null,
            d.optionB.clinicalProfile || null,
            JSON.stringify(d.optionB.allergens || [])
          ]
        )
      }

      // Opción C ('C')
      if (d.optionC) {
        const diaIdC = await generarIdUnico('menu_b2b_dias')
        const proteinNum = parseFloat(String(d.optionC.protein || '0').replace('g', '')) || 0
        const carbsNum = parseFloat(String(d.optionC.carbs || '0').replace('g', '')) || 0
        const fatsNum = parseFloat(String(d.optionC.fats || '0').replace('g', '')) || 0

        await client.query(
          `INSERT INTO menu_b2b_dias (
            id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, 
            categoria, calorias, proteinas_g, carbohidratos_g, grasas_g, 
            ingredientes, metodo_preparacion, imagen_url
          ) VALUES ($1, $2, $3, $4, 'C', $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            diaIdC,
            menuId,
            dayName,
            diaFecha,
            d.optionC.name || 'Opción C',
            d.optionC.category || dietOptionC,
            parseInt(d.optionC.calories, 10) || 390,
            proteinNum,
            carbsNum,
            fatsNum,
            d.optionC.recipe?.ingredients || '',
            d.optionC.recipe?.method || '',
            d.optionC.image || null
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
    estado = 'confirmado',
    empleadoNombre: reqNombre,
    empleadoEmail: reqEmail
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

    // 3. Insertar selecciones en pedido_b2b_detalles y construir resumen para notificación
    const summaryPlatillos = []
    const daysArr = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    for (const [key, val] of Object.entries(selections)) {
      const diaSemana = daysArr[parseInt(key, 10)] || key
      const opcion = (val.platoFuerte || val.opcion || 'A').toUpperCase()

      // Buscar si existe el platillo en menu_b2b_dias
      const diaRes = await client.query(
        `SELECT id, nombre_platillo, calorias, proteinas_g, carbohidratos_g, grasas_g, fecha, imagen_url 
         FROM menu_b2b_dias 
         WHERE menu_id = $1 AND dia_semana = $2 AND tipo_opcion = $3`,
        [menuId, diaSemana, opcion]
      )
      const menuDiaId = diaRes.rowCount > 0 ? diaRes.rows[0].id : null
      const platilloNombre = diaRes.rowCount > 0 ? diaRes.rows[0].nombre_platillo : (val.nombrePlatillo || `Platillo Opción ${opcion}`)
      const calorias = diaRes.rowCount > 0 ? diaRes.rows[0].calorias : (val.calories || val.calorias || null)
      const proteina = diaRes.rowCount > 0 && diaRes.rows[0].proteinas_g != null ? `${diaRes.rows[0].proteinas_g}g` : (val.protein || val.proteina || null)
      const carbohidratos = diaRes.rowCount > 0 && diaRes.rows[0].carbohidratos_g != null ? `${diaRes.rows[0].carbohidratos_g}g` : (val.carbs || val.carbohidratos || null)
      const fecha = diaRes.rowCount > 0 ? diaRes.rows[0].fecha : (val.fecha || null)
      const imagenUrl = diaRes.rowCount > 0 ? diaRes.rows[0].imagen_url : (val.image || val.imagenUrl || null)

      summaryPlatillos.push({
        diaSemana,
        opcion,
        platilloNombre,
        calorias,
        proteina,
        carbohidratos,
        fecha,
        imagenUrl
      })

      const detalleId = await generarIdUnico('pedido_b2b_detalles')
      await client.query(
        `INSERT INTO pedido_b2b_detalles (
          id, pedido_id, menu_dia_id, dia_semana, opcion_seleccionada, notas_adicionales
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [detalleId, pedidoId, menuDiaId, diaSemana, opcion, val.notas || null]
      )
    }

    // 4. Resolver datos de contacto del empleado para el correo
    let empleadoNombre = reqNombre || null
    let empleadoEmail = reqEmail || null

    if (!empleadoEmail || !empleadoNombre) {
      try {
        const userRes = await client.query(
          `SELECT nombre, email FROM usuarios WHERE id::text = $1 OR email = $1
           UNION ALL
           SELECT nombre, email FROM usuarios_empresas WHERE id::text = $1 OR email = $1
           LIMIT 1`,
          [String(usuarioId)]
        )
        if (userRes.rowCount > 0) {
          if (!empleadoNombre) empleadoNombre = userRes.rows[0].nombre
          if (!empleadoEmail) empleadoEmail = userRes.rows[0].email
        }
      } catch (e) {
        console.warn('⚠️ No se pudo resolver usuario_id para email:', e.message)
      }
    }

    await client.query('COMMIT')

    // 5. Despacho asíncrono de notificación transaccional (SMTP o Simulación)
    enviarConfirmacionPedidoB2B({
      empleadoNombre: empleadoNombre || 'Empleado Royal Canin',
      empleadoEmail,
      semana: semanaKey,
      platillos: summaryPlatillos,
      empresa
    }).catch(err => console.error('⚠️ [NotificationService Error]:', err.message))

    return res.status(201).json({
      success: true,
      message: 'Pedido B2B registrado exitosamente en base de datos',
      pedidoId,
      usuarioId,
      semanaKey,
      notificacionDespachada: Boolean(empleadoEmail)
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al guardar pedido B2B:', error)
    return res.status(500).json({ error: 'Error interno al guardar pedido del empleado' })
  } finally {
    client.release()
  }
}
