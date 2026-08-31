import pool from './pool.js'

const resetTablesSQL = `
  -- Borrar todas las tablas existentes
  DROP TABLE IF EXISTS pacientes CASCADE;
  DROP TABLE IF EXISTS pedidos CASCADE;
  DROP TABLE IF EXISTS citas CASCADE;
  DROP TABLE IF EXISTS productos CASCADE;
  DROP TABLE IF EXISTS categorias CASCADE;
  DROP TABLE IF EXISTS usuarios CASCADE;
  DROP TABLE IF EXISTS platillos CASCADE;

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
    categoria_id           TEXT DEFAULT NULL,
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
    paciente_nombre      VARCHAR(150) NOT NULL,
    paciente_email       VARCHAR(200),
    paciente_telefono    VARCHAR(20),
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
    paciente_nombre    VARCHAR(150) NOT NULL,
    paciente_telefono  VARCHAR(20) NOT NULL,
    fecha             DATE NOT NULL,
    horario           VARCHAR(10),
    atencion_previa   VARCHAR(10) DEFAULT 'no',
    peso              DECIMAL(5,2),
    estatura          DECIMAL(5,2),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ DEFAULT NULL
  );

  -- 6. Pacientes (Expedientes Clínicos)
  CREATE TABLE pacientes (
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

  -- 9. Platillos (Catálogo)
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

  -- 10. Menus Semanales
  CREATE TABLE IF NOT EXISTS menus_semanales (
    id                  VARCHAR(8) PRIMARY KEY,
    paciente_id          VARCHAR(8) NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    nombre              VARCHAR(255) NOT NULL,
    semana_inicio       DATE NOT NULL,
    lunes_desayuno      JSONB,
    lunes_colacion_am   JSONB,
    lunes_comida        JSONB,
    lunes_colacion_pm   JSONB,
    lunes_cena          JSONB,
    martes_desayuno     JSONB,
    martes_colacion_am  JSONB,
    martes_comida       JSONB,
    martes_colacion_pm  JSONB,
    martes_cena         JSONB,
    miercoles_desayuno  JSONB,
    miercoles_colacion_am JSONB,
    miercoles_comida    JSONB,
    miercoles_colacion_pm JSONB,
    miercoles_cena      JSONB,
    jueves_desayuno     JSONB,
    jueves_colacion_am  JSONB,
    jueves_comida       JSONB,
    jueves_colacion_pm  JSONB,
    jueves_cena         JSONB,
    viernes_desayuno    JSONB,
    viernes_colacion_am JSONB,
    viernes_comida      JSONB,
    viernes_colacion_pm JSONB,
    viernes_cena        JSONB,
    sabado_desayuno     JSONB,
    sabado_colacion_am  JSONB,
    sabado_comida       JSONB,
    sabado_colacion_pm  JSONB,
    sabado_cena         JSONB,
    domingo_desayuno    JSONB,
    domingo_colacion_am JSONB,
    domingo_comida      JSONB,
    domingo_colacion_pm JSONB,
    domingo_cena        JSONB,
    notas               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 11. Expedientes Clínicos
  CREATE TABLE IF NOT EXISTS expedientes_clinicos (
    id                  VARCHAR(8) PRIMARY KEY,
    paciente_id          VARCHAR(8) NOT NULL UNIQUE REFERENCES pacientes(id) ON DELETE CASCADE,
    diagnostico         TEXT,
    objetivo_nutricional TEXT,
    notas_medicas       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 12. Mediciones Antropométricas
  CREATE TABLE IF NOT EXISTS mediciones_antropometricas (
    id                  VARCHAR(8) PRIMARY KEY,
    paciente_id          VARCHAR(8) NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
    peso                DECIMAL(10,2),
    porcentaje_grasa    DECIMAL(10,2),
    masa_muscular       DECIMAL(10,2),
    porcentaje_agua     DECIMAL(10,2),
    grasa_visceral      DECIMAL(10,2),
    cintura             DECIMAL(10,2),
    cadera              DECIMAL(10,2),
    brazo               DECIMAL(10,2),
    observaciones       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 13. Ingresos y Tesorería
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

  -- 14. Posts del Blog
  CREATE TABLE IF NOT EXISTS posts_blog (
    id                VARCHAR(8) PRIMARY KEY,
    titulo            VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL UNIQUE,
    resumen           TEXT DEFAULT NULL,
    contenido_html    TEXT NOT NULL,
    imagen_url        TEXT DEFAULT NULL,
    autor             VARCHAR(150) NOT NULL DEFAULT 'Dra. Alexa Lora',
    fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado            VARCHAR(20) NOT NULL DEFAULT 'Publicado' CHECK (estado IN ('Borrador', 'Publicado', 'Archivado')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ DEFAULT NULL
  );
`

async function migrateAll() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creando tablas en la base de datos Neon PostgreSQL...')
    await client.query(resetTablesSQL)
    console.log('✅ Tablas creadas correctamente (usuarios, categorias, productos, pedidos, citas, pacientes).')
  } catch (err) {
    console.error('❌ Error en el reinicio de tablas:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrateAll()
