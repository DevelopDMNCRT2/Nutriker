import express from 'express'
import {
  getPlatillos,
  getPlatilloById,
  createPlatillo,
  updatePlatillo,
  deletePlatillo
} from '../controllers/platillosController.js'
import { verificarToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protegemos todas las rutas de este router
router.use(verificarToken)

router.get('/', getPlatillos)
router.get('/:id', getPlatilloById)
router.post('/', createPlatillo)
router.put('/:id', updatePlatillo)
router.delete('/:id', deletePlatillo)

export default router
