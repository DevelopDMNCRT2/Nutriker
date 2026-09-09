import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from './pool.js'
import bcrypt from 'bcrypt'
import { generarIdUnico } from '../utils/generarId.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function seedRoyalRoles() {
  const client = await pool.connect()
  try {
    console.log('🌱 Sembrando usuarios con roles de Royal Canin en Neon PostgreSQL...')

    const hashedPassNutri = await bcrypt.hash('admin123', 10)
    const hashedPassChef = await bcrypt.hash('chef123', 10)
    const hashedPassEmpleado = await bcrypt.hash('empleado123', 10)

    // 1. Nutrióloga
    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol, fecha_alta)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      ON CONFLICT (usuario) DO UPDATE SET rol = $6, contrasena = $5;
    `, [await generarIdUnico('usuarios'), 'Dra. Karla (Nutrióloga)', 'nutri_karla', 'nutriola@royalcanin.com', hashedPassNutri, 'Nutriologa'])

    // 2. Chef
    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol, fecha_alta)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      ON CONFLICT (usuario) DO UPDATE SET rol = $6, contrasena = $5;
    `, [await generarIdUnico('usuarios'), 'Chef Marcos', 'chef_marcos', 'chef@royalcanin.com', hashedPassChef, 'Chef'])

    // 3. Empleado
    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol, fecha_alta)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      ON CONFLICT (usuario) DO UPDATE SET rol = $6, contrasena = $5;
    `, [await generarIdUnico('usuarios'), 'Juan Pérez (Empleado)', 'empleado_rc', 'empleado@royalcanin.com', hashedPassEmpleado, 'Empleado'])

    console.log('✅ Usuarios con roles de Royal Canin creados / actualizados exitosamente.')
  } catch (error) {
    console.error('❌ Error sembrando usuarios Royal Canin:', error)
  } finally {
    client.release()
    process.exit(0)
  }
}

seedRoyalRoles()
