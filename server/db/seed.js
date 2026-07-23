import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pool from './pool.js'
import bcrypt from 'bcrypt'
import { generarIdUnico } from '../utils/generarId.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function seed() {
  const client = await pool.connect()
  try {
    console.log('🌱 Sembrando datos iniciales en Neon PostgreSQL...')

    // 1. Crear Usuario Admin por defecto
    const hashedPassAdmin = await bcrypt.hash('admin123', 10)
    const adminId = await generarIdUnico('usuarios')
    
    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol, fecha_alta)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      ON CONFLICT (usuario) DO NOTHING;
    `, [adminId, 'Administrador Principal', 'admin', 'admin@nutriker.com', hashedPassAdmin, 'Administrador'])

    // 2. Crear Asistente de prueba
    const hashedPassAsistente = await bcrypt.hash('asistente123', 10)
    const asistenteId = await generarIdUnico('usuarios')

    await client.query(`
      INSERT INTO usuarios (id, nombre, usuario, correo, contrasena, rol, fecha_alta)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      ON CONFLICT (usuario) DO NOTHING;
    `, [asistenteId, 'Asistente Recepción', 'asistente_01', 'recepcion@nutriker.com', hashedPassAsistente, 'Asistente'])

    // 3. Citas iniciales de prueba
    const cita1Id = await generarIdUnico('citas')
    await client.query(`
      INSERT INTO citas (id, cliente_nombre, cliente_telefono, fecha, horario, atencion_previa, peso, estatura)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [cita1Id, 'Ana Sofía Montenegro', '5544221100', '2026-04-14', '10:30', 'no', 72.5, 1.63])

    const cita2Id = await generarIdUnico('citas')
    await client.query(`
      INSERT INTO citas (id, cliente_nombre, cliente_telefono, fecha, horario, atencion_previa, peso, estatura)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [cita2Id, 'Fernando Rafael Orozco', '3311998800', '2026-04-17', '14:00', 'si', 88.0, 1.80])

    // 4. Clientes (Expedientes de prueba)
    const cliente1Id = await generarIdUnico('clientes')
    await client.query(`
      INSERT INTO clientes (
        id, cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
        patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
        peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
        ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
    `, [
      cliente1Id, cita1Id, 'Ana Sofía Montenegro', '5544221100', 'ana_montenegro@gmail.com', 31,
      'Arquitecta', 'Busco mejorar mi composición corporal y energía, trabajo muchas horas sentada.',
      'Resistencia a la insulina hace 2 años.', 'Padre con diabetes tipo 2', 'Glucosa en 98, insulina un poco elevada.',
      'Metformina 500mg', 'Inflamación por las tardes', 72.5, 1.63, 'Cintura: 85cm, Cadera: 98cm',
      '35% grasa corporal', 'Desayuno: Pan tostado con huevo y café. Almuerzo: Ensalada rápida. Cena: Pollo y arroz.',
      'Intolerancia a la lactosa', '2 veces por semana', 'Me encanta el aguacate y el pollo. No aguanto el pescado.',
      'Cocino yo en las noches.', 'Voy al gym 3 días a la semana, pesas.', '2026-04-14', '10:30', 'no'
    ])

    const cliente2Id = await generarIdUnico('clientes')
    await client.query(`
      INSERT INTO clientes (
        id, cita_id, nombre, telefono, correo, edad, ocupacion, motivo_consulta,
        patologias, antecedentes_familiares, bioquimicos, farmacos, digestiva,
        peso, estatura, circunferencias, composicion, recordatorio_24h, alergias,
        ultraprocesados, gustos, logistica_cocina, estilo_vida, fecha, horario, atencion_previa
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
    `, [
      cliente2Id, cita2Id, 'Fernando Rafael Orozco', '3311998800', 'ferorozco@yahoo.es', 45,
      'Ingeniero', 'Hipertensión e hipertrofia muscular. Quiero subir masa limpia.',
      'Hipertensión leve', 'Madre con HTA', 'Triglicéridos en 160', 'Losartán',
      'Sin problemas aparentes', 88.0, 1.80, 'Cintura: 90cm', '20% grasa corporal',
      'Mucha proteína, avena, batidos.', 'Ninguna', 'Muy poco, los fines de semana',
      'Todo en especial la pasta.', 'Mi esposa cocina.', 'Corredor aficionado, 10km semanales.',
      '2026-04-17', '14:00', 'si'
    ])

    // 5. Categorías iniciales
    const cat1Id = await generarIdUnico('categorias')
    await client.query(`
      INSERT INTO categorias (id, nombre, descripcion)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING;
    `, [cat1Id, 'Suplementos', 'Suplementos alimenticios y proteínas de alta calidad'])

    const cat2Id = await generarIdUnico('categorias')
    await client.query(`
      INSERT INTO categorias (id, nombre, descripcion)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING;
    `, [cat2Id, 'Snacks Saludables', 'Barras, frutos secos y galletas nutritivas'])

    // 6. Productos iniciales
    const prod1Id = await generarIdUnico('productos')
    await client.query(`
      INSERT INTO productos (id, nombre, descripcion, descripcion_detallada, precio, descuento, stock, categoria_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [prod1Id, 'Proteína Whey NutriKer 1kg', 'Proteína aislada de suero de leche sabor vainilla.', 'Rica en BCAAs, bajo en carbohidratos y sin azúcar añadida. Ideal para recuperación muscular.', 799.00, 10, 25, cat1Id])

    const prod2Id = await generarIdUnico('productos')
    await client.query(`
      INSERT INTO productos (id, nombre, descripcion, descripcion_detallada, precio, descuento, stock, categoria_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `, [prod2Id, 'Barra de Proteína Keto (12 pzas)', 'Barras energéticas bajas en carbohidratos.', 'Contiene almendras, cacao orgánico y eritritol. Snack perfecto pre o post entrenamiento.', 450.00, 0, 40, cat2Id])

    console.log('✅ Datos iniciales sembrados correctamente en la base de datos de Neon.')
  } catch (err) {
    console.error('❌ Error sembrando datos:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
