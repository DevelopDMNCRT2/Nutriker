import pool from './pool.js'

async function migrate() {
  console.log('Iniciando migración de platillos...')

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platillos (
        id                VARCHAR(8) PRIMARY KEY,
        nombre            VARCHAR(150) NOT NULL UNIQUE,
        receta            TEXT,
        info_nutricional  JSONB DEFAULT '{}'::jsonb,
        costos            JSONB DEFAULT '[]'::jsonb,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at        TIMESTAMPTZ DEFAULT NULL
      );
    `)
    console.log('Tabla platillos creada/verificada correctamente.')
    
    // Check if menus_semanales columns need changing. 
    // They are currently TEXT, which can store JSON perfectly fine in Postgres.
    // So no schema change is strictly needed for menus_semanales, we will just start saving JSON strings in them!
    
  } catch (err) {
    console.error('Error durante la migración de platillos:', err)
  } finally {
    pool.end()
  }
}

migrate()
