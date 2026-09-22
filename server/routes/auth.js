import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, loginPaciente, recuperarInfo, enviarLinkRecuperacion, resetPassword, generarSSOToken, registroEmpleado } from '../controllers/authController.js'
import { verificarToken } from '../middleware/authMiddleware.js'

const router = Router()

// Rate limit para registro de empleados contra ataques de fuerza bruta y saturación de CPU
const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 intentos de registro por IP por hora
  message: { error: 'Demasiadas solicitudes de registro desde esta conexión. Por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/login', login)
router.post('/login-paciente', loginPaciente)
router.post('/registro-empleado', registroLimiter, registroEmpleado)
router.post('/recuperar-info', recuperarInfo)
router.post('/enviar-link', enviarLinkRecuperacion)
router.post('/reset-password', resetPassword)
router.get('/sso-token', verificarToken, generarSSOToken)

export default router

