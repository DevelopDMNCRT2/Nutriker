import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log('⏳ Creando tablas del catálogo SMAE 2024/2026...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS grupos_equivalentes (
        id          SERIAL PRIMARY KEY,
        clave       VARCHAR(30) UNIQUE NOT NULL,
        nombre      VARCHAR(100) NOT NULL,
        descripcion TEXT,
        kcal        NUMERIC(6,1) NOT NULL,
        proteina_g  NUMERIC(5,1) NOT NULL DEFAULT 0,
        lipidos_g   NUMERIC(5,1) NOT NULL DEFAULT 0,
        hco_g       NUMERIC(5,1) NOT NULL DEFAULT 0,
        color_hex   VARCHAR(7)   DEFAULT '#6b7280'
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS alimentos_smae (
        id                SERIAL PRIMARY KEY,
        grupo_id          INTEGER NOT NULL REFERENCES grupos_equivalentes(id),
        nombre            VARCHAR(200) NOT NULL,
        cantidad_medida   VARCHAR(100),
        peso_neto_g       NUMERIC(7,2),
        kcal              NUMERIC(6,1),
        proteina_g        NUMERIC(5,1),
        lipidos_g         NUMERIC(5,1),
        hco_g             NUMERIC(5,1),
        fibra_g           NUMERIC(5,1),
        sodio_mg          NUMERIC(7,1),
        activo            BOOLEAN DEFAULT TRUE,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    console.log('✅ Tablas creadas.')
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error en migración SMAE:', err.message)
    throw err
  } finally {
    client.release()
    pool.end()
  }
}

run()
