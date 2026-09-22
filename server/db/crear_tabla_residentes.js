import pool from './pool.js'

async function crearTablaResidentes() {
  const client = await pool.connect()
  try {
    console.log('🚀 Iniciando creación de tabla de Residentes (Casa Nostra / Senior Care)...')
    await client.query('BEGIN')

    // 1. Crear Tabla Residentes aislada e independiente
    await client.query(`
      CREATE TABLE IF NOT EXISTS residentes (
        id VARCHAR(20) PRIMARY KEY,
        centro_residencia VARCHAR(100) NOT NULL DEFAULT 'Casa Nostra',
        nombre VARCHAR(150) NOT NULL,
        edad INTEGER,
        habitacion VARCHAR(50) NOT NULL,
        restricciones TEXT[] DEFAULT '{}',
        asistencia VARCHAR(100) DEFAULT 'Comedor Autónomo',
        observaciones TEXT,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log('✅ Tabla "residentes" creada o verificada exitosamente.')

    // 2. Índice para consultas rápidas por centro de residencia y habitación
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_residentes_centro_hab 
      ON residentes(centro_residencia, habitacion);
    `)
    console.log('✅ Índice "idx_residentes_centro_hab" creado o verificado exitosamente.')

    // 3. Sembrar datos iniciales si la tabla está vacía
    const countRes = await client.query('SELECT COUNT(*) AS total FROM residentes WHERE centro_residencia = $1', ['Casa Nostra'])
    const totalResidentes = parseInt(countRes.rows[0].total, 10)

    if (totalResidentes === 0) {
      console.log('🌱 Sembrando residentes iniciales de Casa Nostra...')
      const iniciales = [
        {
          id: 'RES-101',
          nombre: 'Doña Carmen Salinas',
          edad: 84,
          habitacion: '101-A',
          restricciones: ['Hiposódica', 'Bajo en Grasa'],
          asistencia: 'Comedor General Asistido',
          observaciones: 'Requiere apoyo para cortar por artritis en manos. Buena deglución.'
        },
        {
          id: 'RES-102',
          nombre: 'Don Roberto Garza',
          edad: 89,
          habitacion: '102-B',
          restricciones: ['Diabético', 'Hiposódica'],
          asistencia: 'En Cama / Habitación',
          observaciones: 'Disfagia moderada a líquidos finos. Utilizar espesante nivel 3.'
        },
        {
          id: 'RES-103',
          nombre: 'Sra. Margarita Valenzuela',
          edad: 79,
          habitacion: '201-A',
          restricciones: ['Sin Lactosa'],
          asistencia: 'Comedor Autónomo',
          observaciones: 'Tolera carnes suaves cocidas a fuego lento. Bebe agua con normalidad.'
        },
        {
          id: 'RES-104',
          nombre: 'Don Francisco Mendoza',
          edad: 82,
          habitacion: '203-A',
          restricciones: ['Ninguna'],
          asistencia: 'Comedor Autónomo',
          observaciones: 'Excelente apetito. Alta preferencia por legumbres y sopas calientes.'
        },
        {
          id: 'RES-105',
          nombre: 'Doña Elena Castro',
          edad: 91,
          habitacion: '105-B',
          restricciones: ['Hiposódica', 'Sin Gluten'],
          asistencia: 'Comedor General Asistido',
          observaciones: 'Monitorear fatiga durante la comida. Dividir en raciones pequeñas y frecuentes.'
        },
        {
          id: 'RES-106',
          nombre: 'Don Alberto Ruiz',
          edad: 76,
          habitacion: '204-B',
          restricciones: ['Diabético'],
          asistencia: 'Comedor Autónomo',
          observaciones: 'Control de glucosa postprandial. Postres 100% sin azúcar refinada.'
        }
      ]

      for (const res of iniciales) {
        await client.query(`
          INSERT INTO residentes (id, centro_residencia, nombre, edad, habitacion, restricciones, asistencia, observaciones)
          VALUES ($1, 'Casa Nostra', $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING;
        `, [res.id, res.nombre, res.edad, res.habitacion, res.restricciones, res.asistencia, res.observaciones])
      }
      console.log(`✅ ${iniciales.length} residentes iniciales insertados en la base de datos.`)
    } else {
      console.log(`ℹ️ La tabla ya contiene ${totalResidentes} residentes registrados para Casa Nostra.`)
    }

    await client.query('COMMIT')
    console.log('🎉 Migración de residentes completada con éxito sin afectar otras entidades.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error durante la migración de tabla residentes:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

crearTablaResidentes().catch(() => process.exit(1))
