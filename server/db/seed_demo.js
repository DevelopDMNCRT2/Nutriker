import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from './pool.js'
import bcrypt from 'bcrypt'
import { generarIdUnico } from '../utils/generarId.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

// Helpers para datos aleatorios
const nombres = ['María José', 'Carlos', 'Ana Sofía', 'Fernando', 'Laura', 'Diego', 'Valeria', 'Jorge', 'Daniela', 'Ricardo', 'Camila', 'Alejandro', 'Andrea', 'Javier', 'Mariana', 'Luis', 'Isabella', 'Gabriel', 'Valentina', 'Eduardo']
const apellidos = ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez', 'Gómez', 'Sánchez', 'Díaz', 'Torres', 'Ramírez', 'Flores', 'Benítez', 'Mendoza']
const motivos = ['Bajar de peso y porcentaje de grasa', 'Aumento de masa muscular', 'Control de diabetes', 'Resistencia a la insulina', 'Nutrición deportiva', 'SOP y nutrición hormonal', 'Mejora de digestión y gastritis', 'Hipertensión']

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function seedMassive() {
  const client = await pool.connect()
  try {
    console.log('🌱 Iniciando Seed Masivo: Simulación de 1 Mes de Trabajo...')

    // 1. Usuarios Admin
    const hashedPassAdmin = await bcrypt.hash('admin123', 10)
    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol)
      VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (usuario) DO NOTHING
    `, [await generarIdUnico('usuarios'), 'Dra. Karla (Admin)', 'admin', 'admin@nutriker.com', hashedPassAdmin, 'Administrador'])

    // 2. Categorías y Productos
    const cat1Id = await generarIdUnico('categorias')
    const cat2Id = await generarIdUnico('categorias')
    await client.query('INSERT INTO categorias (id, nombre, descripcion) VALUES ($1, $2, $3)', [cat1Id, 'Suplementos', 'Proteínas y vitaminas'])
    await client.query('INSERT INTO categorias (id, nombre, descripcion) VALUES ($1, $2, $3)', [cat2Id, 'Snacks Saludables', 'Libres de azúcar'])

    await client.query('INSERT INTO productos (id, nombre, descripcion, descripcion_detallada, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [await generarIdUnico('productos'), 'Proteína Whey NutriKer', 'Aislado de suero', 'Excelente digestión', 799, 50, cat1Id])
    await client.query('INSERT INTO productos (id, nombre, descripcion, descripcion_detallada, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [await generarIdUnico('productos'), 'Creatina Monohidratada', 'Aumenta fuerza', '100% Pura', 450, 20, cat1Id])
    await client.query('INSERT INTO productos (id, nombre, descripcion, descripcion_detallada, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [await generarIdUnico('productos'), 'Barras Keto Cacao', 'Caja 12 pzas', 'Bajas en CH', 350, 100, cat2Id])

    // Zonas Envio
    await client.query('INSERT INTO zonas_envio (id, nombre, tipo_region, costo) VALUES ($1, $2, $3, $4)', [await generarIdUnico('zonas_envio'), 'Local Guadalajara', 'Local', 50])
    
    // Órdenes (E-Commerce) - 10 pedidos históricos
    for (let i = 0; i < 10; i++) {
      const pId = await generarIdUnico('pedidos')
      const total = getRandomInt(450, 1500)
      const estado = getRandomItem(['En proceso', 'completado', 'completado', 'pendiente'])
      await client.query('INSERT INTO pedidos (id, cliente_nombre, total, direccion_entrega, ciudad, estado, codigo_postal, estado_pedido, metodo_pago) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
      [pId, `${getRandomItem(nombres)} ${getRandomItem(apellidos)}`, total, 'Calle Falsa 123', 'Guadalajara', 'Jalisco', '45000', estado, 'Tarjeta'])
    }

    // 3. Generar 30 Clientes (1 mes de trabajo)
    const clientesGenerados = []
    for (let i = 0; i < 30; i++) {
      const nombre = `${getRandomItem(nombres)} ${getRandomItem(apellidos)}`
      const clienteId = await generarIdUnico('clientes')
      
      const f = new Date()
      f.setDate(f.getDate() - getRandomInt(1, 30)) // Fecha de registro
      const fechaRegistro = f.toISOString().split('T')[0]
      
      await client.query(`
        INSERT INTO clientes (id, nombre, telefono, correo, edad, ocupacion, motivo_consulta, peso, estatura, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [clienteId, nombre, `331${getRandomInt(1000000, 9999999)}`, `paciente${i}@correo.com`, getRandomInt(20, 60), 'Oficina', getRandomItem(motivos), getRandomInt(60, 100), getRandomInt(155, 190)/100, fechaRegistro])

      clientesGenerados.push({ id: clienteId, nombre, fechaRegistro })

      // Expediente
      await client.query('INSERT INTO expedientes_clinicos (id, cliente_id, diagnostico, objetivo_nutricional) VALUES ($1, $2, $3, $4)', 
      [await generarIdUnico('expedientes_clinicos'), clienteId, 'Evaluación inicial completada.', 'Mejorar hábitos alimenticios y composición corporal.'])
      
      // Mediciones
      for(let m=0; m<2; m++) {
        await client.query('INSERT INTO mediciones_antropometricas (id, cliente_id, peso, porcentaje_grasa, masa_muscular) VALUES ($1, $2, $3, $4, $5)', 
        [await generarIdUnico('mediciones_antropometricas'), clienteId, getRandomInt(60, 90), getRandomInt(15, 35), getRandomInt(30, 50)])
      }
    }

    // 4. Citas
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - diaSemana + 1)
    
    let citasGeneradas = 0;
    for (let d = 0; d < 5; d++) {
      const fechaCita = new Date(inicioSemana)
      fechaCita.setDate(inicioSemana.getDate() + d)
      const dateStr = fechaCita.toISOString().split('T')[0]
      
      const horarios = ['09:00', '10:30', '12:00', '16:00', '17:30', '19:00']
      for (let h = 0; h < getRandomInt(3, 6); h++) {
        const clienteRandom = getRandomItem(clientesGenerados)
        await client.query(`
          INSERT INTO citas (id, cliente_nombre, cliente_telefono, fecha, horario, atencion_previa)
          VALUES ($1, $2, $3, $4, $5, 'si')
        `, [await generarIdUnico('citas'), clienteRandom.nombre, '3310000000', dateStr, horarios[h]])
        citasGeneradas++;
      }
    }

    // 5. Menús Semanales
    for (let i = 0; i < 5; i++) {
      const c = getRandomItem(clientesGenerados)
      await client.query(`
        INSERT INTO menus_semanales (id, cliente_id, nombre, semana_inicio, lunes_desayuno, lunes_comida, lunes_cena, martes_desayuno, martes_comida, martes_cena)
        VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9)
      `, [await generarIdUnico('menus_semanales'), c.id, 'Plan de Seguimiento Semanal', 'Huevo a la mexicana', 'Pechuga asada con nopal', 'Ensalada de atún', 'Avena con fruta', 'Salmón con verduras', 'Yogur con chía'])
    }

    console.log(`✅ Seed Masivo Exitoso: 30 Clientes, ${citasGeneradas} Citas para esta semana, 10 Órdenes, 5 Menús creados.`)
  } catch (err) {
    console.error('❌ Error en Seed Masivo:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

seedMassive()
