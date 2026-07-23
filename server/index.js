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

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: '*',
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

// ── 404 ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

// ── Servidor ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Servidor NutriKer corriendo en http://localhost:${PORT}`)
})