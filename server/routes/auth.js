import { Router } from 'express'
import { login, loginPaciente } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.post('/login-paciente', loginPaciente)

export default router
