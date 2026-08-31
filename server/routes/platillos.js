import express from 'express'
import {
  getPlatillos,
  getPlatilloById,
  createPlatillo,
  updatePlatillo,
  deletePlatillo
} from '../controllers/platillosController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Aplica el middleware de autenticación a todas las rutas
router.use(authMiddleware)

router.get('/', getPlatillos)
router.get('/:id', getPlatilloById)
router.post('/', createPlatillo)
router.put('/:id', updatePlatillo)
router.delete('/:id', deletePlatillo)

export default router
