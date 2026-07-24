import { Router } from 'express'
import {
  getMenusByCliente,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menusController.js'

const router = Router()

router.get('/cliente/:clienteId', getMenusByCliente)
router.get('/:id', getMenuById)
router.post('/', createMenu)
router.put('/:id', updateMenu)
router.delete('/:id', deleteMenu)

export default router
