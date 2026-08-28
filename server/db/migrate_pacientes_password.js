import pool from './pool.js'
import bcrypt from 'bcrypt'

async function migratePacientesPassword() {
  const client = await pool.connect()
  try {
    console.log('Iniciando migración de contraseñas para pacientes...')
    
    // 1. Añadir la columna si no existe
    await client.query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS contrasena VARCHAR(255)
    `)
    console.log('✅ Columna contrasena asegurada en tabla pacientes')

    // 2. Obtener todos los pacientes que no tienen contraseña
    const res = await client.query('SELECT id, telefono FROM pacientes WHERE contrasena IS NULL')
    const pacientes = res.rows
    console.log(`Encontrados ${pacientes.length} pacientes sin contraseña. Generando contraseñas por defecto...`)

    // 3. Generar hash (bcrypt) y actualizar cada paciente
    for (const p of pacientes) {
      if (!p.telefono) {
        console.warn(`⚠️ Paciente ID ${p.id} no tiene teléfono, omitiendo.`)
        continue
      }
      // Usar el teléfono como contraseña por defecto
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(p.telefono, salt)
      
      await client.query('UPDATE pacientes SET contrasena = $1 WHERE id = $2', [hash, p.id])
    }
    
    console.log('✅ Migración de contraseñas completada exitosamente.')
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    client.release()
    pool.end()
  }
}

migratePacientesPassword()
