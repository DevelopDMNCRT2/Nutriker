import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from './pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function createCitasMonexTable() {
  const client = await pool.connect()
  try {
    console.log('⏳ Creando tabla citas_monex...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS citas_monex (
        id VARCHAR(50) PRIMARY KEY,
        paciente_nombre VARCHAR(150) NOT NULL,
        paciente_telefono VARCHAR(20) NOT NULL,
        correo VARCHAR(150) NOT NULL,
        fecha DATE NOT NULL,
        horario VARCHAR(10) NOT NULL,
        empresa VARCHAR(100) DEFAULT 'Monex',
        estado VARCHAR(50) DEFAULT 'Confirmada',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      );
    `)
    console.log('✅ Tabla citas_monex creada con éxito!')
  } catch (error) {
    console.error('❌ Error creando tabla citas_monex:', error)
  } finally {
    client.release()
  }
}

createCitasMonexTable().then(() => process.exit(0)).catch(() => process.exit(1))
