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

import { getPublicPosts, getPostBySlug } from '../controllers/blogController.js'

// Endpoints públicos para Blog / Noticias de Salud
router.get('/blog', getPublicPosts)
router.get('/blog/:slug', getPostBySlug)

export default router
