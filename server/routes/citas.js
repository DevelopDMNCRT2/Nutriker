import express from 'express'
import { verificarToken, verificarRol } from '../middleware/authMiddleware.js'
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
  getHorariosOcupados
} from '../controllers/citasController.js'

import multer from 'multer'
import { importarCitas } from '../controllers/importadorController.js'

/**
 * Rutas de Gestión de Citas Médicas
 */
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Rutas públicas (sin auth)
router.post('/', createCita)
router.get('/horarios-ocupados', getHorariosOcupados)

// Rutas protegidas (Personal Clínico / Administrativo Autorizado)
const rolesClinicos = verificarRol('Administrador', 'Nutrióloga', 'RRHH')
router.get('/', verificarToken, rolesClinicos, getCitas)
router.post('/importar', verificarToken, rolesClinicos, upload.single('archivo'), importarCitas)
router.get('/:id', verificarToken, rolesClinicos, getCitaById)
router.put('/:id', verificarToken, rolesClinicos, updateCita)
router.delete('/:id', verificarToken, rolesClinicos, deleteCita)

export default router
