import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from './pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function updateRolConstraint() {
  const client = await pool.connect()
  try {
    console.log('🔄 Actualizando constraint usuarios_rol_check para roles Royal Canin...')
    
    await client.query(`
      ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
      ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check 
      CHECK (rol IN ('Administrador', 'Asistente', 'RRHH', 'Nutriologa', 'Chef', 'Empleado'));
    `)

    console.log('✅ Constraint usuarios_rol_check actualizada con éxito.')
  } catch (err) {
    console.error('❌ Error actualizando constraint:', err)
  } finally {
    client.release()
  }
}

updateRolConstraint()
