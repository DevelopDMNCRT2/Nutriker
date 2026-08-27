import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('⏳ Añadiendo columna password a citas_monex...')
    await client.query(`
      ALTER TABLE citas_monex 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `)
    console.log('✅ Columna password agregada exitosamente a citas_monex.')
  } catch (err) {
    console.error('❌ Error añadiendo columna password:', err)
  } finally {
    client.release()
    pool.end()
  }
}

run()
