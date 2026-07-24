import { Router } from 'express'
import {
  getExpedienteByCliente,
  createMedicion,
  updateExpediente,
} from '../controllers/expedientesController.js'

const router = Router()

router.get('/cliente/:clienteId', getExpedienteByCliente)
router.post('/mediciones', createMedicion)
router.put('/cliente/:clienteId', updateExpediente)

export default router
