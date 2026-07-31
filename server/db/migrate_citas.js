import pool from './pool.js'

const createCitasSQL = `
  CREATE TABLE IF NOT EXISTS citas (
    id                VARCHAR(8) PRIMARY KEY,
    cliente_nombre    VARCHAR(150) NOT NULL,
    cliente_telefono  VARCHAR(20) NOT NULL,
    fecha             DATE NOT NULL,
    horario           VARCHAR(10),
    atencion_previa   VARCHAR(10) DEFAULT 'no',
    peso              DECIMAL(5,2),
    estatura          DECIMAL(5,2),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ DEFAULT NULL
  );
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Ejecutando migración de Citas...')
    await client.query(createCitasSQL)
    console.log('✅ Tabla "citas" creada/verificada correctamente.')
  } catch (err) {
    console.error('❌ Error en la migración de citas:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
