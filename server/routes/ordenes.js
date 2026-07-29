import express from 'express'
import { verificarToken } from '../middleware/authMiddleware.js'
import {
  getOrdenes,
  getOrdenById,
  createOrden,
  updateEstadoOrden,
  updateEstadoEnvio,
  deleteOrden
} from '../controllers/ordenesController.js'

const router = express.Router()

// Rutas públicas (para crear ordenes de compra desde cliente/checkout)
router.post('/', createOrden)

// Rutas protegidas (Admin)
router.get('/', verificarToken, getOrdenes)
router.get('/:id', verificarToken, getOrdenById)
router.put('/:id/estado-orden', verificarToken, updateEstadoOrden)
router.put('/:id/estado-envio', verificarToken, updateEstadoEnvio)
router.delete('/:id', verificarToken, deleteOrden)

export default router
