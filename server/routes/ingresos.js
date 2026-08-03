import express from 'express'
import { verificarToken } from '../middleware/authMiddleware.js'
import {
  getIngresos,
  getIngresoById,
  createIngreso,
  updateIngreso,
  deleteIngreso
} from '../controllers/ingresosController.js'

/**
 * Rutas de Gestión de Finanzas e Ingresos (Tesorería)
 */
const router = express.Router()

// Todas las rutas de tesorería requieren token JWT de Admin
router.get('/', verificarToken, getIngresos)
router.get('/:id', verificarToken, getIngresoById)
router.post('/', verificarToken, createIngreso)
router.put('/:id', verificarToken, updateIngreso)
router.delete('/:id', verificarToken, deleteIngreso)

export default router
