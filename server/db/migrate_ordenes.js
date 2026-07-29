import pool from './pool.js'

const createOrdenesTablesSQL = `
  -- 1. Crear tabla ordenes
  CREATE TABLE IF NOT EXISTS ordenes (
    id                  VARCHAR(8) PRIMARY KEY,
    cliente_nombre      VARCHAR(150) NOT NULL,
    cliente_email       VARCHAR(200),
    cliente_telefono    VARCHAR(20),
    total               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    direccion_entrega   TEXT NOT NULL,
    ciudad              VARCHAR(100) DEFAULT 'Ciudad de México',
    estado_orden        VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado_orden IN ('Pendiente', 'Pagado', 'Rechazado', 'Completado', 'Cancelado')),
    estado_envio        VARCHAR(50) NOT NULL DEFAULT 'En preparación' CHECK (estado_envio IN ('En preparación', 'En camino', 'Entregado', 'Devuelto')),
    zona_envio_id       VARCHAR(8) REFERENCES zonas_envio(id) ON DELETE SET NULL,
    metodo_pago         VARCHAR(50) NOT NULL DEFAULT 'Tarjeta de Crédito/Débito',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ DEFAULT NULL
  );

  -- 2. Crear tabla detalles_orden
  CREATE TABLE IF NOT EXISTS detalles_orden (
    id                  VARCHAR(8) PRIMARY KEY,
    orden_id            VARCHAR(8) NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id         VARCHAR(8) REFERENCES productos(id) ON DELETE SET NULL,
    producto_nombre     VARCHAR(150) NOT NULL,
    cantidad            INTEGER NOT NULL DEFAULT 1,
    precio_unitario     DECIMAL(10,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`

async function migrateOrdenes() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creando tablas de órdenes y detalles_orden en PostgreSQL Neon...')
    await client.query(createOrdenesTablesSQL)
    console.log('✅ Tablas `ordenes` y `detalles_orden` creadas o verificadas exitosamente.')
  } catch (err) {
    console.error('❌ Error al crear tablas de órdenes:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrateOrdenes()
