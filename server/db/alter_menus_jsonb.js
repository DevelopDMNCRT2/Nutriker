import pool from './pool.js'

async function migrate() {
  console.log('Iniciando migración de menus_semanales a JSONB...')
  const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
  const TIEMPOS = ['desayuno', 'colacion_am', 'comida', 'colacion_pm', 'cena']
  const columnasMenu = DIAS.flatMap(dia => TIEMPOS.map(t => `${dia}_${t}`))

  try {
    const alterQueries = columnasMenu.map(col => 
      `ALTER TABLE menus_semanales ALTER COLUMN ${col} TYPE JSONB USING (
        CASE 
          WHEN ${col} IS NULL THEN NULL 
          WHEN ${col} = '' THEN NULL
          WHEN ${col} LIKE '{%' THEN ${col}::jsonb
          ELSE jsonb_build_object('nombre', ${col}) 
        END
      );`
    )

    await pool.query(`BEGIN;`)
    for (const q of alterQueries) {
      await pool.query(q)
    }
    await pool.query(`COMMIT;`)
    console.log('Columnas migradas a JSONB exitosamente.')
  } catch (err) {
    await pool.query(`ROLLBACK;`)
    console.error('Error durante la migración:', err)
  } finally {
    pool.end()
  }
}

migrate()
