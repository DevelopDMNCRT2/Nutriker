import express from 'express'
import { getResumenDiario } from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/resumen-diario', getResumenDiario)

export default router
