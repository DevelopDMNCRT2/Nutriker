import { Router } from 'express'
import { login, loginPaciente, recuperarInfo, enviarLinkRecuperacion, resetPassword, generarSSOToken } from '../controllers/authController.js'
import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/login', login)
router.post('/login-paciente', loginPaciente)
router.post('/recuperar-info', recuperarInfo)
router.post('/enviar-link', enviarLinkRecuperacion)
router.post('/reset-password', resetPassword)
router.get('/sso-token', verificarToken, generarSSOToken)

export default router
