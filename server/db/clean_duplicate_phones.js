import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log('⏳ Buscando duplicados en citas...')

    // Eliminamos duplicados en citas dejando la de mayor created_at
    const deleteCitas = await client.query(`
      DELETE FROM citas a
      USING citas b
      WHERE a.paciente_telefono = b.paciente_telefono
        AND a.paciente_telefono IS NOT NULL
        AND a.paciente_telefono != ''
        AND a.created_at < b.created_at;
    `)
    console.log(`✅ ${deleteCitas.rowCount} citas duplicadas eliminadas en 'citas'.`)

    // Eliminamos duplicados en citas_monex dejando la de mayor created_at
    const deleteCitasMonex = await client.query(`
      DELETE FROM citas_monex a
      USING citas_monex b
      WHERE a.paciente_telefono = b.paciente_telefono
        AND a.paciente_telefono IS NOT NULL
        AND a.paciente_telefono != ''
        AND a.created_at < b.created_at;
    `)
    console.log(`✅ ${deleteCitasMonex.rowCount} citas duplicadas eliminadas en 'citas_monex'.`)

    // Si hay un teléfono que está tanto en 'citas' como en 'citas_monex', eliminamos la más antigua.
    // Como están en tablas diferentes, decidiremos priorizar la más reciente.
    // Borramos en citas si existe en monex y monex es más reciente:
    const deleteCitasCross = await client.query(`
      DELETE FROM citas a
      USING citas_monex b
      WHERE a.paciente_telefono = b.paciente_telefono
        AND a.paciente_telefono IS NOT NULL
        AND a.paciente_telefono != ''
        AND a.created_at < b.created_at;
    `)
    console.log(`✅ ${deleteCitasCross.rowCount} citas eliminadas en 'citas' por ser más antiguas que en 'citas_monex'.`)

    // Borramos en monex si existe en citas y citas es más reciente:
    const deleteCitasMonexCross = await client.query(`
      DELETE FROM citas_monex a
      USING citas b
      WHERE a.paciente_telefono = b.paciente_telefono
        AND a.paciente_telefono IS NOT NULL
        AND a.paciente_telefono != ''
        AND a.created_at < b.created_at;
    `)
    console.log(`✅ ${deleteCitasMonexCross.rowCount} citas eliminadas en 'citas_monex' por ser más antiguas que en 'citas'.`)

    await client.query('COMMIT')
    console.log('✅ Proceso de limpieza finalizado exitosamente.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error limpiando duplicados:', err)
  } finally {
    client.release()
    pool.end()
  }
}

run()
