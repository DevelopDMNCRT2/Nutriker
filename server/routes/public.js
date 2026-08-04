import express from 'express'
import {
  getProductosPublicos,
  getZonasEnvioPublicas,
  procesarCheckoutPublico,
  agendarCitaPublica,
  loginPaciente,
  getPortalPaciente
} from '../controllers/publicController.js'
import { getHorariosOcupados } from '../controllers/citasController.js'
import { getPublicPosts, getPostBySlug } from '../controllers/blogController.js'

const router = express.Router()

// Endpoint público para catálogo de productos
router.get('/productos', getProductosPublicos)

// Endpoint público para consultar zonas de envío activas
router.get('/zonas-envio', getZonasEnvioPublicas)

// Endpoint público para procesar compras / checkout
router.post('/checkout', procesarCheckoutPublico)

// Endpoint público para agendar citas
router.post('/citas', agendarCitaPublica)

// Endpoint público para consultar horarios ocupados por fecha
router.get('/horarios-ocupados', getHorariosOcupados)

// Endpoints públicos para autenticación y portal del paciente
router.post('/paciente/login', loginPaciente)
router.get('/paciente/portal', getPortalPaciente)

// Endpoints públicos para Blog / Noticias de Salud
router.get('/blog', getPublicPosts)
router.get('/blog/:slug', getPostBySlug)

export default router
