import pool from './pool.js'

const createIngresosSQL = `
  CREATE TABLE IF NOT EXISTS ingresos (
    id            VARCHAR(8) PRIMARY KEY,
    fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
    concepto      VARCHAR(200) NOT NULL,
    a_nombre_de   VARCHAR(150) NOT NULL,
    recibe        VARCHAR(150) NOT NULL DEFAULT 'Dra. Alexa Lora',
    cantidad      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago   VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    notas         TEXT DEFAULT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ DEFAULT NULL
  );
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Ejecutando migración de Ingresos y Tesorería...')
    await client.query(createIngresosSQL)
    console.log('✅ Tabla "ingresos" creada/verificada correctamente en Neon DB.')
  } catch (err) {
    console.error('❌ Error en la migración de ingresos:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
