import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Verificar columnas actuales
    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pacientes' ORDER BY ordinal_position
    `)
    console.log('Columnas actuales en pacientes:', rows.map(r => r.column_name).join(', '))

    console.log('⏳ Añadiendo columna cirugia a pacientes (si no existe)...')
    await client.query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS cirugia TEXT;
    `)
    console.log('✅ Columna cirugia añadida exitosamente.')
  } catch (err) {
    console.error('❌ Error en migración:', err.message)
  } finally {
    client.release()
    pool.end()
  }
}

run()
