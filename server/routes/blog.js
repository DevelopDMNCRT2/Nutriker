import express from 'express'
import { verificarToken } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/upload.js'
import {
  getPublicPosts,
  getPostBySlug,
  getAdminPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  uploadImagen
} from '../controllers/blogController.js'

/**
 * Rutas de Blog CMS (Públicas y de Administración con Cloudinary)
 */
const router = express.Router()

// Rutas Públicas (para Landing Page / Cliente)
router.get('/', getPublicPosts)
router.get('/post/:slug', getPostBySlug)

// Rutas Protegidas de Administración
router.get('/admin/all', verificarToken, getAdminPosts)
router.get('/admin/:id', verificarToken, getPostById)
router.post('/upload-imagen', verificarToken, upload.single('imagen'), uploadImagen)
router.post('/', verificarToken, upload.single('imagen'), createPost)
router.put('/:id', verificarToken, upload.single('imagen'), updatePost)
router.delete('/:id', verificarToken, deletePost)

export default router
