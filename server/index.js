import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import usuariosRouter from './routes/usuarios.js'
import productosRouter from './routes/productos.js'
import categoriasRouter from './routes/categorias.js'
import pedidosRouter from './routes/pedidos.js'
import citasRouter from './routes/citas.js'
import clientesRouter from './routes/clientes.js'
import authRouter from './routes/auth.js'
import dashboardRouter from './routes/dashboard.js'
import menusRouter from './routes/menus.js'
import expedientesRouter from './routes/expedientes.js'
import zonasEnvioRouter from './routes/zonasEnvio.js'
import iaRouter from './routes/ia.js'
import ordenesRouter from './routes/ordenes.js'
import publicRouter from './routes/public.js'
import blogRouter from './routes/blog.js'
import ingresosRouter from './routes/ingresos.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5178'],
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Archivos estáticos ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')))

// ── Ruta raíz ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('API NutriKer funcionando 🚀')
})

// ── Rutas API ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/productos', productosRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/pedidos', pedidosRouter)
app.use('/api/citas', citasRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/menus', menusRouter)
app.use('/api/expedientes', expedientesRouter)
app.use('/api/zonas-envio', zonasEnvioRouter)
app.use('/api/ia', iaRouter)
app.use('/api/ordenes', ordenesRouter)
app.use('/api/ingresos', ingresosRouter)
app.use('/api/blog', blogRouter)
app.use('/api/public', publicRouter)

// ── 404 ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

// ── Servidor ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Servidor NutriKer corriendo en http://localhost:${PORT}`)
})