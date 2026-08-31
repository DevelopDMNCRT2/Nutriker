import { Router } from 'express'
import {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
  getSugerencias
} from '../controllers/pacientesController.js'

const router = Router()

router.get('/', getPacientes)
router.get('/sugerencias', getSugerencias)
router.get('/:id', getPacienteById)
router.post('/', createPaciente)
router.put('/:id', updatePaciente)
router.delete('/:id', deletePaciente)

export default router
