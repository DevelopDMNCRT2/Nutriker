import express from 'express'
import { verificarToken } from '../middleware/authMiddleware.js'
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
  getHorariosOcupados
} from '../controllers/citasController.js'

/**
 * Rutas de Gestión de Citas Médicas
 */
const router = express.Router()

// Rutas públicas (sin auth)
router.post('/', createCita)
router.get('/horarios-ocupados', getHorariosOcupados)

// Rutas protegidas (Admin)
router.get('/', verificarToken, getCitas)
router.get('/:id', verificarToken, getCitaById)
router.put('/:id', verificarToken, updateCita)
router.delete('/:id', verificarToken, deleteCita)

export default router
