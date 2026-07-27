import { Router } from 'express'
import { sintetizarNotas, chatAsistente } from '../controllers/iaController.js'

const router = Router()

router.post('/sintetizar-notas', sintetizarNotas)
router.post('/chat-asistente', chatAsistente)

export default router
