import { Router } from 'express'
import { sintetizarNotas, chatAsistente, generarMenu } from '../controllers/iaController.js'

const router = Router()

router.post('/sintetizar-notas', sintetizarNotas)
router.post('/chat-asistente', chatAsistente)
router.post('/generar-menu', generarMenu)

export default router
