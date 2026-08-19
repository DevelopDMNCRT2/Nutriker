import pool from './pool.js'

async function alterMediciones() {
  try {
    console.log('⏳ Alterando la tabla mediciones_antropometricas...')
    
    // Eliminar campos antiguos
    await pool.query(`
      ALTER TABLE mediciones_antropometricas 
      DROP COLUMN IF EXISTS porcentaje_grasa,
      DROP COLUMN IF EXISTS masa_muscular,
      DROP COLUMN IF EXISTS porcentaje_agua,
      DROP COLUMN IF EXISTS grasa_visceral,
      DROP COLUMN IF EXISTS brazo;
    `)
    
    // Agregar nuevos campos
    await pool.query(`
      ALTER TABLE mediciones_antropometricas 
      ADD COLUMN IF NOT EXISTS talla DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS brazo_relajado DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS brazo_flexionado DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS abdomen DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS muslo DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS pantorrilla DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS imc DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS indice_cc DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS riesgo_imc VARCHAR(50),
      ADD COLUMN IF NOT EXISTS riesgo_cc VARCHAR(50);
    `)
    
    console.log('✅ Tabla mediciones_antropometricas actualizada con éxito.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error alterando la tabla:', error)
    process.exit(1)
  }
}

alterMediciones()
