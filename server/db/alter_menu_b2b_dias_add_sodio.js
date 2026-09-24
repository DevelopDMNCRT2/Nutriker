import pool from './pool.js'

const SQL = `
  ALTER TABLE menu_b2b_dias 
  ADD COLUMN IF NOT EXISTS sodio_mg INT DEFAULT 340;

  UPDATE menu_b2b_dias 
  SET sodio_mg = 340 
  WHERE sodio_mg IS NULL;

  UPDATE menu_b2b_dias
  SET sodio_mg = 380
  WHERE nombre_platillo ILIKE '%camaron%' OR nombre_platillo ILIKE '%camarón%';

  UPDATE menu_b2b_dias
  SET sodio_mg = 410
  WHERE nombre_platillo ILIKE '%tortilla%';
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Alterando tabla menu_b2b_dias (añadiendo columna sodio_mg)...')
    await client.query(SQL)
    console.log('✅ Columna "sodio_mg" añadida y actualizada exitosamente en "menu_b2b_dias".')
  } catch (err) {
    console.error('❌ Error en la alteración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
