import { Router } from 'express'
import {
  getZonasEnvio,
  getZonaEnvioById,
  createZonaEnvio,
  updateZonaEnvio,
  deleteZonaEnvio,
} from '../controllers/zonasEnvioController.js'

const router = Router()

router.get('/', getZonasEnvio)
router.get('/:id', getZonaEnvioById)
router.post('/', createZonaEnvio)
router.put('/:id', updateZonaEnvio)
router.delete('/:id', deleteZonaEnvio)

export default router
