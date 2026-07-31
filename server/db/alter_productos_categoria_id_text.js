import pool from './pool.js'

const SQL = `
  ALTER TABLE productos ALTER COLUMN categoria_id TYPE TEXT;
  ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_id_fkey;
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Ejecutando migración de multicategorías en productos...')
    await client.query(SQL)
    console.log('✅ Columna categoria_id actualizada a TEXT y FK liberada en Neon DB.')
  } catch (err) {
    console.error('❌ Error en la migración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
