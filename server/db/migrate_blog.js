import pool from './pool.js'

const createBlogSQL = `
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

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🚀 Ejecutando migración de Blog CMS...')
    await client.query(createBlogSQL)
    console.log('✅ Tabla "posts_blog" creada/verificada correctamente en Neon DB.')
  } catch (err) {
    console.error('❌ Error en la migración de blog:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
