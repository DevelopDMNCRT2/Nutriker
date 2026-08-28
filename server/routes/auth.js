import { Router } from 'express'
import { login, loginPaciente, recuperarInfo, enviarLinkRecuperacion, resetPassword } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.post('/login-paciente', loginPaciente)
router.post('/recuperar-info', recuperarInfo)
router.post('/enviar-link', enviarLinkRecuperacion)
router.post('/reset-password', resetPassword)

export default router
