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

// Endpoint público para agendar citas
router.post('/citas', agendarCitaPublica)

import { getHorariosOcupados } from '../controllers/citasController.js'
// Endpoint público para consultar horarios ocupados por fecha
router.get('/horarios-ocupados', getHorariosOcupados)

import { getPublicPosts, getPostBySlug } from '../controllers/blogController.js'

// Endpoints públicos para Blog / Noticias de Salud
router.get('/blog', getPublicPosts)
router.get('/blog/:slug', getPostBySlug)

export default router
