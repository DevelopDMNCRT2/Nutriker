import { Router } from 'express'
import { sintetizarNotas, chatAsistente, generarMenu, analizarPlatillo } from '../controllers/iaController.js'

const router = Router()

router.post('/sintetizar-notas', sintetizarNotas)
router.post('/chat-asistente', chatAsistente)
router.post('/generar-menu', generarMenu)
router.post('/analizar-platillo', analizarPlatillo)

export default router
