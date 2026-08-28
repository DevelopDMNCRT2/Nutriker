import { Router } from 'express'
import {
  getMenusByPaciente,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menusController.js'

const router = Router()

router.get('/paciente/:pacienteId', getMenusByPaciente)
router.get('/:id', getMenuById)
router.post('/', createMenu)
router.put('/:id', updateMenu)
router.delete('/:id', deleteMenu)

export default router
