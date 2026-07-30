import express from 'express'
import {
  getProductosPublicos,
  getZonasEnvioPublicas,
  procesarCheckoutPublico,
  agendarCitaPublica
} from '../controllers/publicController.js'

const router = express.Router()

// Endpoint público para catálogo de productos
router.get('/productos', getProductosPublicos)

// Endpoint público para consultar zonas de envío activas
router.get('/zonas-envio', getZonasEnvioPublicas)

// Endpoint público para procesar compras / checkout
router.post('/checkout', procesarCheckoutPublico)

// Endpoint público para agendar citas en línea
router.post('/citas', agendarCitaPublica)

export default router
