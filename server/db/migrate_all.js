import pool from './pool.js'

const resetTablesSQL = `
  -- Borrar todas las tablas existentes
  DROP TABLE IF EXISTS clientes CASCADE;
  DROP TABLE IF EXISTS pedidos CASCADE;
  DROP TABLE IF EXISTS citas CASCADE;
  DROP TABLE IF EXISTS productos CASCADE;
  DROP TABLE IF EXISTS categorias CASCADE;
  DROP TABLE IF EXISTS usuarios CASCADE;

  -- 1. Usuarios
  CREATE TABLE usuarios (
    id          VARCHAR(8) PRIMARY KEY,
    nombre      VARCHAR(150)  NOT NULL,
    usuario     VARCHAR(100)  NOT NULL UNIQUE,
    correo      VARCHAR(200)  NOT NULL UNIQUE,
    contrasena  TEXT          NOT NULL,
    rol         VARCHAR(20)   NOT NULL DEFAULT 'Asistente' CHECK (rol IN ('Administrador', 'Asistente')),
    fecha_alta  DATE          NOT NULL DEFAULT CURRENT_DATE,
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ   DEFAULT NULL
  );

  -- 2. Categorías
  CREATE TABLE categorias (
    id              VARCHAR(8) PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ DEFAULT NULL
  );

  -- 3. Productos
  CREATE TABLE productos (
    id                     VARCHAR(8) PRIMARY KEY,
    categoria_id           VARCHAR(8) REFERENCES categorias(id) ON DELETE SET NULL,
    nombre                 VARCHAR(150) NOT NULL,
    descripcion            TEXT NOT NULL,
    descripcion_detallada  TEXT NOT NULL,
    precio                 DECIMAL(10,2) NOT NULL,
    descuento              DECIMAL(5,2) DEFAULT 0.00,
    precio_final           DECIMAL(10,2) GENERATED ALWAYS AS (precio * (1 - descuento/100)) STORED,
    stock                  INTEGER NOT NULL DEFAULT 0,
    imagen_principal       VARCHAR(255),
    galeria                JSONB DEFAULT '[]'::jsonb,
    creado_en              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at             TIMESTAMPTZ DEFAULT NULL
  );

  -- 4. Pedidos
  CREATE TABLE pedidos (
    id                  VARCHAR(8) PRIMARY KEY,
    cliente_nombre      VARCHAR(150) NOT NULL,
    cliente_email       VARCHAR(200),
    cliente_telefono    VARCHAR(20),
    total               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    direccion_entrega   TEXT NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    estado              VARCHAR(100) NOT NULL,
    codigo_postal       VARCHAR(20) NOT NULL,
    notas               TEXT,
    estado_pedido       VARCHAR(50) NOT NULL DEFAULT 'En proceso' CHECK (estado_pedido IN ('En proceso', 'pendiente', 'completado', 'cancelado', 'fallido', 'rembolsado')),
    metodo_pago         VARCHAR(50) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ DEFAULT NULL
  );

  -- 5. Citas
  CREATE TABLE citas (
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

  -- 6. Clientes (Expedientes Clínicos)
  CREATE TABLE clientes (
    id                      VARCHAR(8) PRIMARY KEY,
    cita_id                 VARCHAR(8) REFERENCES citas(id) ON DELETE SET NULL,
    nombre                  VARCHAR(150) NOT NULL,
    telefono                VARCHAR(20) NOT NULL,
    correo                  VARCHAR(200),
    edad                    INTEGER,
    ocupacion               VARCHAR(150),
    motivo_consulta         TEXT,
    patologias              TEXT,
    antecedentes_familiares TEXT,
    bioquimicos             TEXT,
    farmacos                TEXT,
    digestiva               TEXT,
    peso                    DECIMAL(5,2),
    estatura                DECIMAL(5,2),
    circunferencias         TEXT,
    composicion             TEXT,
    recordatorio_24h        TEXT,
    alergias                TEXT,
    ultraprocesados         TEXT,
    gustos                  TEXT,
    logistica_cocina        TEXT,
    estilo_vida             TEXT,
    fecha                   DATE,
    horario                 VARCHAR(10),
    atencion_previa         VARCHAR(10) DEFAULT 'no',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ DEFAULT NULL
  );
`

async function migrateAll() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creando tablas en la base de datos Neon PostgreSQL...')
    await client.query(resetTablesSQL)
    console.log('✅ Tablas creadas correctamente (usuarios, categorias, productos, pedidos, citas, clientes).')
  } catch (err) {
    console.error('❌ Error en el reinicio de tablas:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrateAll()
