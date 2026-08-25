import { Router } from 'express'
import {
  getExpedienteByCliente,
  createMedicion,
  updateMedicion,
  deleteMedicion,
  updateExpediente,
} from '../controllers/expedientesController.js'

const router = Router()

// Expediente clínico (compatible con ruta /cliente/:id y /paciente/:id)
router.get('/cliente/:clienteId',  getExpedienteByCliente)
router.get('/paciente/:pacienteId', getExpedienteByCliente)
router.put('/cliente/:clienteId',  updateExpediente)
router.put('/paciente/:pacienteId', updateExpediente)

// Mediciones antropométricas
router.post('/mediciones',         createMedicion)
router.put('/mediciones/:id',      updateMedicion)
router.delete('/mediciones/:id',   deleteMedicion)

export default router
