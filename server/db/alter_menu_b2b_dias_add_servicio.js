import pool from './pool.js'

const SQL = `
  ALTER TABLE menu_b2b_dias 
  ADD COLUMN IF NOT EXISTS servicio VARCHAR(20) DEFAULT 'comida';

  UPDATE menu_b2b_dias 
  SET servicio = 'comida' 
  WHERE servicio IS NULL;

  ALTER TABLE menu_b2b_dias DROP CONSTRAINT IF EXISTS uq_menu_dia_opcion;

  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'uq_menu_dia_opcion_servicio'
    ) THEN
      ALTER TABLE menu_b2b_dias 
      ADD CONSTRAINT uq_menu_dia_opcion_servicio UNIQUE (menu_id, dia_semana, tipo_opcion, servicio);
    END IF;
  END $$;
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Alterando tabla menu_b2b_dias (añadiendo columna servicio y actualizando restricción única)...')
    await client.query(SQL)
    console.log('✅ Columna "servicio" y restricción "uq_menu_dia_opcion_servicio" creadas exitosamente.')
  } catch (err) {
    console.error('❌ Error en la alteración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
