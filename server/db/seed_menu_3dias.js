import pool from './pool.js'
import { generarIdUnico } from '../utils/generarId.js'

export async function seedMenu3Dias() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const semanaKey = '2026-09-14'
    const empresa = 'Royal Canin'

    // 1. Obtener o crear menú en menus_b2b
    const menuRes = await client.query(
      'SELECT id FROM menus_b2b WHERE empresa = $1 AND semana_key = $2',
      [empresa, semanaKey]
    )

    let menuId
    if (menuRes.rowCount > 0) {
      menuId = menuRes.rows[0].id
      await client.query(
        `UPDATE menus_b2b 
         SET dias_servicio = 3, publicado = true, fecha_inicio = '2026-09-14', fecha_fin = '2026-09-18' 
         WHERE id = $1`,
        [menuId]
      )
      await client.query('DELETE FROM menu_b2b_dias WHERE menu_id = $1', [menuId])
    } else {
      menuId = await generarIdUnico('menus_b2b')
      await client.query(
        `INSERT INTO menus_b2b (id, empresa, semana_key, semana_numero, dias_servicio, publicado, fecha_inicio, fecha_fin)
         VALUES ($1, $2, $3, 6, 3, true, '2026-09-14', '2026-09-18')`,
        [menuId, empresa, semanaKey]
      )
    }

    // 2. Insertar los 3 días de servicio: Lunes, Miércoles y Viernes
    const dishes = [
      // LUNES
      {
        dia: 'Lunes',
        fecha: '2026-09-14',
        opcion: 'A',
        nombre: 'Pechuga al Romero con Quinoa',
        categoria: 'Balance Proteico',
        calorias: 480,
        proteinas: 38.00,
        carbohidratos: 42.00,
        grasas: 12.00,
        ingredientes: 'Pechuga de pollo al romero, quinoa tricolor, calabacitas salteadas con aceite de oliva y sal marina',
        metodo: 'Cocción a la plancha a 180°C y quinoa al vapor.',
        imagen: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
      },
      {
        dia: 'Lunes',
        fecha: '2026-09-14',
        opcion: 'B',
        nombre: 'Bowl de Garbanzos y Espinacas',
        categoria: 'Plant-Based & Digestión Ligera',
        calorias: 420,
        proteinas: 18.00,
        carbohidratos: 50.00,
        grasas: 12.00,
        ingredientes: 'Garbanzos crujientes horneados, espinaca fresca, aderezo tahini y ajonjolí tostado',
        metodo: 'Horneado de garbanzos a 200°C con especias mediterráneas.',
        imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
      },
      // MIÉRCOLES
      {
        dia: 'Miércoles',
        fecha: '2026-09-16',
        opcion: 'A',
        nombre: 'Salmón a las Finas Hierbas con Arroz Salvaje',
        categoria: 'Balance Proteico',
        calorias: 520,
        proteinas: 36.00,
        carbohidratos: 40.00,
        grasas: 16.00,
        ingredientes: 'Filete de salmón fresco, eneldo, limón eureka, arroz salvaje con almendras y espárragos al vapor',
        metodo: 'Sellado a fuego medio en sartén y terminado al horno.',
        imagen: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'
      },
      {
        dia: 'Miércoles',
        fecha: '2026-09-16',
        opcion: 'B',
        nombre: 'Wrap Mediterráneo de Vegetales y Hummus',
        categoria: 'Plant-Based & Digestión Ligera',
        calorias: 410,
        proteinas: 16.00,
        carbohidratos: 52.00,
        grasas: 14.00,
        ingredientes: 'Tortilla integral de espinaca, hummus artesanal de garbanzo, pimientos asados, pepino y arúgula',
        metodo: 'Asado al carbón de vegetales y ensamble en frío.',
        imagen: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
      },
      // VIERNES
      {
        dia: 'Viernes',
        fecha: '2026-09-18',
        opcion: 'A',
        nombre: 'Fajitas de Pollo con Pimientos y Guacamole',
        categoria: 'Balance Proteico',
        calorias: 490,
        proteinas: 35.00,
        carbohidratos: 38.00,
        grasas: 15.00,
        ingredientes: 'Tiras de pechuga marinada en cítricos, pimiento rojo y verde, cebolla morada y guacamole rústico',
        metodo: 'Salteado estilo wok a alta temperatura.',
        imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
      },
      {
        dia: 'Viernes',
        fecha: '2026-09-18',
        opcion: 'B',
        nombre: 'Lasaña Vegetariana con Ensalada Fresca',
        categoria: 'Plant-Based & Digestión Ligera',
        calorias: 430,
        proteinas: 17.00,
        carbohidratos: 48.00,
        grasas: 13.00,
        ingredientes: 'Láminas de pasta integral, capas de berenjena, calabacín, salsa pomodoro casera y queso ricotta bajo en grasa',
        metodo: 'Horneado a 190°C por 35 minutos con gratinado ligero.',
        imagen: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80'
      }
    ]

    for (const d of dishes) {
      const diaId = await generarIdUnico('menu_b2b_dias')
      await client.query(
        `INSERT INTO menu_b2b_dias (
          id, menu_id, dia_semana, fecha, tipo_opcion, nombre_platillo, categoria,
          calorias, proteinas_g, carbohidratos_g, grasas_g, ingredientes, metodo_preparacion, imagen_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          diaId, menuId, d.dia, d.fecha, d.opcion, d.nombre, d.categoria,
          d.calorias, d.proteinas, d.carbohidratos, d.grasas, d.ingredientes, d.metodo, d.imagen
        ]
      )
    }

    await client.query('COMMIT')
    console.log('✅ Menú de 3 días (Lunes, Miércoles, Viernes) guardado en PostgreSQL Neon para semana:', semanaKey)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al guardar menú de 3 días:', error)
  } finally {
    client.release()
  }
}

if (process.argv[1]?.endsWith('seed_menu_3dias.js')) {
  seedMenu3Dias().then(() => pool.end())
}
