import { Router } from 'express'
import {
  obtenerMenuSemana,
  guardarMenuSemana,
  obtenerPedidosSemana,
  guardarPedidoEmpleado
} from '../controllers/royalController.js'

const router = Router()

// Rutas de Menús B2B
router.get('/menu/actual', obtenerMenuSemana)
router.post('/menu', guardarMenuSemana)

// Rutas de Pedidos de Empleados B2B
router.get('/pedidos/:semana', obtenerPedidosSemana)
router.post('/pedidos', guardarPedidoEmpleado)

export default router
