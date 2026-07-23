import pool from '../db/pool.js'

/**
 * GET /api/dashboard/resumen-diario
 * Retorna el saludo dinámico, citas del día, métricas e indicadores para el Dashboard "Buenos Días"
 */
export const getResumenDiario = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().getHours()

    // Determinar saludo dinámico
    let saludo = '¡Buenos días, Dra. Karla! ☀️'
    if (hour >= 12 && hour < 19) {
      saludo = '¡Buenas tardes, Dra. Karla! 🌤️'
    } else if (hour >= 19 || hour < 6) {
      saludo = '¡Buenas noches, Dra. Karla! 🌙'
    }

    // Consultar citas de hoy
    const citasHoyRes = await pool.query(
      `SELECT * FROM citas 
       WHERE fecha::text LIKE $1 AND deleted_at IS NULL 
       ORDER BY horario ASC`,
      [`${today}%`]
    )

    // Consultar total de citas acumuladas
    const totalCitasRes = await pool.query(
      `SELECT COUNT(*) FROM citas WHERE deleted_at IS NULL`
    )

    // Consultar total de expedientes de clientes registrados
    const totalClientesRes = await pool.query(
      `SELECT COUNT(*) FROM clientes WHERE deleted_at IS NULL`
    )

    const citasHoy = citasHoyRes.rows
    const totalCitas = parseInt(totalCitasRes.rows[0].count, 10) || 0
    const totalClientes = parseInt(totalClientesRes.rows[0].count, 10) || 0

    // Tareas / Alertas diarias dinámicas
    const tareas = [
      { id: '1', texto: 'Revisar expediente de primera consulta de hoy', completada: false },
      { id: '2', texto: 'Enviar recordatorio de citas para el día de mañana', completada: false },
      { id: '3', texto: 'Actualizar laboratorios bioquímicos del paciente', completada: true },
    ]

    res.json({
      saludo,
      fechaHoy: today,
      citasHoy,
      totalCitasHoy: citasHoy.length,
      totalCitas,
      totalClientes,
      tareas,
    })
  } catch (error) {
    console.error('Error al obtener resumen diario:', error)
    res.status(500).json({ error: 'Error al obtener resumen del dashboard.' })
  }
}
