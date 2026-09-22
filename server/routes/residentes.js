import { Router } from 'express'
import {
  getResidentes,
  getResidenteById,
  createResidente,
  updateResidente,
  deleteResidente,
  importarResidentes
} from '../controllers/residentesController.js'

const router = Router()

// Rutas de censo e importación
router.get('/', getResidentes)
router.post('/', createResidente)
router.post('/importar', importarResidentes)

// Rutas por ID
router.get('/:id', getResidenteById)
router.put('/:id', updateResidente)
router.delete('/:id', deleteResidente)

export default router
