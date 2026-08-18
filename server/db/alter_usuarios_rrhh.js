import pool from './pool.js'

async function alterUsuariosRole() {
  try {
    console.log('⏳ Alterando constraint de roles en la tabla usuarios...')
    
    await pool.query(`
      ALTER TABLE usuarios 
      DROP CONSTRAINT IF EXISTS usuarios_rol_check;
    `)
    
    await pool.query(`
      ALTER TABLE usuarios 
      ADD CONSTRAINT usuarios_rol_check 
      CHECK (rol IN ('Administrador', 'Asistente', 'RRHH'));
    `)
    
    console.log('✅ Constraint actualizada. Rol RRHH ahora es válido.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error alterando la tabla:', error)
    process.exit(1)
  }
}

alterUsuariosRole()
