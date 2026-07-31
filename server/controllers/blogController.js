import pool from '../db/pool.js'
import { generarIdUnico } from '../utils/generarId.js'

/**
 * Controlador de Blog CMS (Artículos y Noticias de Salud)
 */

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// ─── POST /api/blog/upload-imagen (Subir foto a Cloudinary) ───────────────
export const uploadImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo de imagen' })
    }
    // req.file.path contiene la URL de Cloudinary generada por multer-storage-cloudinary
    res.json({ url: req.file.path })
  } catch (error) {
    console.error('uploadImagen error:', error.message)
    res.status(500).json({ error: 'Error al subir la imagen a Cloudinary', detalle: error.message })
  }
}

// ─── GET /api/blog (Público - Solo artículos en estado 'Publicado') ──────────
export const getPublicPosts = async (req, res) => {
  try {
    const query = `
      SELECT id,
             titulo,
             slug,
             resumen,
             contenido_html,
             imagen_url,
             autor,
             TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion",
             estado,
             created_at
      FROM posts_blog
      WHERE estado = 'Publicado' AND deleted_at IS NULL
      ORDER BY fecha_publicacion DESC, created_at DESC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error('getPublicPosts error:', error.message)
    res.status(500).json({ error: 'Error al obtener los artículos del blog', detalle: error.message })
  }
}

// ─── GET /api/blog/:slug (Público - Obtener un artículo por slug) ───────────
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const query = `
      SELECT id,
             titulo,
             slug,
             resumen,
             contenido_html,
             imagen_url,
             autor,
             TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion",
             estado,
             created_at
      FROM posts_blog
      WHERE slug = $1 AND estado = 'Publicado' AND deleted_at IS NULL
    `
    const { rows } = await pool.query(query, [slug])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('getPostBySlug error:', error.message)
    res.status(500).json({ error: 'Error al obtener el artículo', detalle: error.message })
  }
}

// ─── GET /api/blog/admin/all (Admin - Todos los artículos) ──────────────────
export const getAdminPosts = async (req, res) => {
  try {
    const query = `
      SELECT id,
             titulo,
             slug,
             resumen,
             contenido_html,
             imagen_url,
             autor,
             TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion",
             estado,
             created_at,
             updated_at
      FROM posts_blog
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error('getAdminPosts error:', error.message)
    res.status(500).json({ error: 'Error al obtener los posts del panel', detalle: error.message })
  }
}

// ─── GET /api/blog/admin/:id (Admin - Obtener post por ID) ──────────────────
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT id,
             titulo,
             slug,
             resumen,
             contenido_html,
             imagen_url,
             autor,
             TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion",
             estado,
             created_at,
             updated_at
      FROM posts_blog
      WHERE id = $1 AND deleted_at IS NULL
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('getPostById error:', error.message)
    res.status(500).json({ error: 'Error al obtener el artículo', detalle: error.message })
  }
}

// ─── POST /api/blog (Admin - Crear nuevo artículo) ──────────────────────────
export const createPost = async (req, res) => {
  try {
    const { titulo, resumen, contenido_html, imagen_url, autor, fecha_publicacion, estado } = req.body

    if (!titulo || !contenido_html) {
      return res.status(400).json({ error: 'El título y el contenido del artículo son obligatorios' })
    }

    const finalImagenUrl = req.file ? req.file.path : (imagen_url || null)

    const baseSlug = slugify(titulo)
    let finalSlug = baseSlug
    const existingSlug = await pool.query('SELECT id FROM posts_blog WHERE slug = $1 AND deleted_at IS NULL', [finalSlug])
    if (existingSlug.rows.length > 0) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`
    }

    const newId = await generarIdUnico('posts_blog')
    const insertQuery = `
      INSERT INTO posts_blog (id, titulo, slug, resumen, contenido_html, imagen_url, autor, fecha_publicacion, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *, TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion"
    `
    const { rows } = await pool.query(insertQuery, [
      newId,
      titulo,
      finalSlug,
      resumen || null,
      contenido_html,
      finalImagenUrl,
      autor || 'Dra. Alexa Lora',
      fecha_publicacion || new Date().toISOString().split('T')[0],
      estado || 'Publicado'
    ])

    res.status(201).json(rows[0])
  } catch (error) {
    console.error('createPost error:', error.message)
    res.status(500).json({ error: 'Error al publicar el artículo', detalle: error.message })
  }
}

// ─── PUT /api/blog/:id (Admin - Actualizar artículo) ─────────────────────────
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, resumen, contenido_html, imagen_url, autor, fecha_publicacion, estado } = req.body

    const existing = await pool.query('SELECT * FROM posts_blog WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' })
    }

    const current = existing.rows[0]
    const finalImagenUrl = req.file ? req.file.path : (imagen_url !== undefined ? imagen_url : current.imagen_url)

    let newSlug = current.slug
    if (titulo && titulo !== current.titulo) {
      const baseSlug = slugify(titulo)
      newSlug = baseSlug
      const existingSlug = await pool.query('SELECT id FROM posts_blog WHERE slug = $1 AND id != $2 AND deleted_at IS NULL', [newSlug, id])
      if (existingSlug.rows.length > 0) {
        newSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`
      }
    }

    const updateQuery = `
      UPDATE posts_blog
      SET titulo = $1, slug = $2, resumen = $3, contenido_html = $4,
          imagen_url = $5, autor = $6, fecha_publicacion = $7, estado = $8, updated_at = NOW()
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING *, TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS "fecha_publicacion"
    `
    const { rows } = await pool.query(updateQuery, [
      titulo || current.titulo,
      newSlug,
      resumen !== undefined ? resumen : current.resumen,
      contenido_html || current.contenido_html,
      finalImagenUrl,
      autor || current.autor,
      fecha_publicacion || current.fecha_publicacion,
      estado || current.estado,
      id
    ])

    res.json(rows[0])
  } catch (error) {
    console.error('updatePost error:', error.message)
    res.status(500).json({ error: 'Error al actualizar el artículo', detalle: error.message })
  }
}

// ─── DELETE /api/blog/:id (Admin - Soft Delete) ─────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      UPDATE posts_blog
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `
    const { rows } = await pool.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' })
    }
    res.json({ message: 'Artículo eliminado correctamente', id: rows[0].id })
  } catch (error) {
    console.error('deletePost error:', error.message)
    res.status(500).json({ error: 'Error al eliminar el artículo', detalle: error.message })
  }
}
