import nodemailer from 'nodemailer'

/**
 * Servicio de Notificaciones Transaccionales (Email & WhatsApp)
 * Maneja el despacho asíncrono de confirmaciones para citas generales y corporativas.
 */

/**
 * Obtiene el transporte SMTP dinámicamente según variables de entorno
 */
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
  return null
}

/**
 * Genera el cuerpo HTML para la confirmación de la cita
 */
function generarPlantillaEmail({ nombre, fecha, horario, servicio, tipo, empresa }) {
  const empresaTag = empresa ? `<span style="background: #EFF6FF; color: #2563EB; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">${empresa}</span>` : ''

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Confirmación de Cita - NutriKer</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A;">
    <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
      
      <!-- Header -->
      <div style="background: #E11D48; padding: 28px 32px; color: #FFFFFF; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NutriKer</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Confirmación de Cita Nutricional</p>
      </div>

      <!-- Contenido -->
      <div style="padding: 32px;">
        <div style="margin-bottom: 20px;">
          ${empresaTag}
        </div>

        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #0F172A;">
          ¡Hola, ${nombre}!
        </h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
          Tu consulta médica nutricional ha sido reservada con éxito. A continuación encontrarás los detalles de tu cita:
        </p>

        <!-- Tarjeta de Detalles -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-weight: 600;">📅 Fecha:</td>
              <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${fecha}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-weight: 600;">⏰ Horario:</td>
              <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${horario} hrs</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-weight: 600;">🥗 Servicio:</td>
              <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${servicio || 'Consulta Nutricional'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-weight: 600;">📍 Modalidad:</td>
              <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${tipo || 'Presencial'}</td>
            </tr>
          </table>
        </div>

        <!-- Indicaciones Previas -->
        <div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 14px 18px; border-radius: 8px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
            <strong>Indicaciones previas:</strong> Te sugerimos presentarte con ropa cómoda, 2 horas de ayuno previo y una adecuada hidratación para la medición antropométrica.
          </p>
        </div>

        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          Si necesitas reagendar o cancelar, por favor ponte en contacto con la clínica con al menos 24 hrs de anticipación.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F1F5F9; padding: 16px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
        NutriKer • Sistema Integral de Gestión Nutricional
      </div>

    </div>
  </body>
  </html>
  `
}

/**
 * Despacha la notificación transaccional de forma asíncrona.
 * Si no hay SMTP configurado (modo dev/local), registra una simulación limpia en consola.
 */
export async function enviarConfirmacionCita({
  nombre,
  correo,
  telefono,
  fecha,
  horario,
  servicio = 'Consulta Nutricional',
  tipo = 'Presencial',
  empresa = null
}) {
  try {
    const htmlContent = generarPlantillaEmail({ nombre, fecha, horario, servicio, tipo, empresa })
    const subject = `Confirmación de tu Cita Nutricional (${fecha} - ${horario}) - NutriKer`
    const transporter = getTransporter()

    // 1. Envío Real por SMTP si las credenciales están configuradas
    if (transporter && correo) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"NutriKer Citas" <citas@nutriker.com>',
        to: correo,
        subject,
        html: htmlContent
      })
      console.log(`📧 [Notificación Email] Enviado con éxito a: ${correo} (ID: ${info.messageId})`)
      return { success: true, channel: 'email', messageId: info.messageId }
    }

    // 2. Simulación en Entorno Local / Dev (Regla WoW: Cero credenciales reales)
    console.log('\n======================================================')
    console.log('🔔 [NOTIFICACIÓN TRANSACCIONAL SIMULADA]')
    console.log(`👤 Paciente: ${nombre}`)
    console.log(`📬 Correo:   ${correo || 'No proporcionado'}`)
    console.log(`📱 Teléfono: ${telefono || 'No proporcionado'}`)
    console.log(`🏢 Empresa:  ${empresa || 'NutriKer Clínica General'}`)
    console.log(`📅 Cita:     ${fecha} a las ${horario} hrs (${tipo} - ${servicio})`)
    console.log('💬 WhatsApp Simulador:')
    console.log(`   "Hola ${nombre}, tu cita en NutriKer para ${servicio} está confirmada para el ${fecha} a las ${horario} hrs."`)
    console.log('======================================================\n')

    return { success: true, simulated: true }
  } catch (error) {
    // Aislamiento total: no frenar la creación de la cita en caso de fallo de red
    console.error('⚠️ [NotificationService Error]: Error al enviar notificación:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Genera el cuerpo HTML para la confirmación de pedidos semanales B2B
 */
function generarPlantillaPedidoB2B({ empleadoNombre, semana, platillos = [], empresa = 'Royal Canin' }) {
  const platillosRows = platillos.map(p => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 700; color: #0F172A;">${p.diaSemana}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">
        <span style="background: ${p.opcion === 'A' ? '#DCFCE7' : '#FEF3C7'}; color: ${p.opcion === 'A' ? '#166534' : '#92400E'}; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 11px;">
          Opción ${p.opcion}
        </span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; font-weight: 600;">
        ${p.platilloNombre || 'Platillo Aprobado'}
        ${p.calorias ? `<div style="font-size: 11px; color: #64748B; font-weight: normal;">${p.calorias} kcal • ${p.proteina || ''} prot</div>` : ''}
      </td>
    </tr>
  `).join('')

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Confirmación de Pedido Semanal - NutriKer B2B</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
      
      <!-- Header Corporativo -->
      <div style="background: #E11D48; padding: 28px 32px; color: #FFFFFF; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NutriKer</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Nutrición Empresarial • <strong>${empresa}</strong></p>
      </div>

      <!-- Contenido -->
      <div style="padding: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <span style="background: #EFF6FF; color: #2563EB; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
            Semana del Servicio: ${semana}
          </span>
          <span style="background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
            ✓ Pedido Confirmado
          </span>
        </div>

        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 10px 0; color: #0F172A;">
          ¡Hola, ${empleadoNombre}!
        </h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Tus selecciones de comida para la semana han sido registradas exitosamente y enviadas a la estación del Chef para su preparación en planta.
        </p>

        <!-- Tabla de Platillos Seleccionados -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #F8FAFC; text-align: left; color: #64748B; font-size: 12px;">
              <th style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0;">Día</th>
              <th style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: center;">Opción</th>
              <th style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0;">Platillo Seleccionado</th>
            </tr>
          </thead>
          <tbody>
            ${platillosRows || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #94A3B8;">Platillos registrados para entrega corporativa.</td></tr>'}
          </tbody>
        </table>

        <!-- Nota Culinaria -->
        <div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
            🥗 <strong>Servicio Incluido:</strong> Todos los platillos son preparados frescos el mismo día con ingredientes de primera calidad e incluyen tu agua fresca natural del día.
          </p>
        </div>

        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          Si requieres realizar alguna modificación de último momento, consulta con la Nutrióloga de planta.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F1F5F9; padding: 16px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
        NutriKer • Plataforma Corporativa ${empresa}
      </div>

    </div>
  </body>
  </html>
  `
}

/**
 * Despacha la notificación transaccional de confirmación de pedido semanal B2B.
 * Soporta envío real SMTP o simulación limpia en consola.
 */
export async function enviarConfirmacionPedidoB2B({
  empleadoNombre,
  empleadoEmail,
  semana,
  platillos = [],
  empresa = 'Royal Canin'
}) {
  try {
    const htmlContent = generarPlantillaPedidoB2B({ empleadoNombre, semana, platillos, empresa })
    const subject = `Confirmación de Menú Semanal B2B (${semana}) - ${empresa}`
    const transporter = getTransporter()

    // 1. Envío Real por SMTP si las credenciales están configuradas
    if (transporter && empleadoEmail) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${empresa} Nutrición" <pedidos@nutriker.com>`,
        to: empleadoEmail,
        subject,
        html: htmlContent
      })
      console.log(`📧 [Notificación Pedido B2B] Correo enviado a: ${empleadoEmail} (ID: ${info.messageId})`)
      return { success: true, channel: 'email', messageId: info.messageId }
    }

    // 2. Simulación en Entorno Local / Dev
    console.log('\n======================================================')
    console.log('🍽️ [NOTIFICACIÓN PEDIDO B2B SIMULADA - SMTP / EMAIL]')
    console.log(`👤 Empleado: ${empleadoNombre}`)
    console.log(`📬 Correo:   ${empleadoEmail || 'No proporcionado / Modo simulación'}`)
    console.log(`🏢 Empresa:  ${empresa}`)
    console.log(`📅 Semana:   ${semana}`)
    console.log(`📋 Platillos: ${platillos.map(p => `${p.diaSemana}: Opción ${p.opcion} (${p.platilloNombre || 'Platillo'})`).join(' | ')}`)
    console.log('💬 WhatsApp Simulador:')
    console.log(`   "¡Hola ${empleadoNombre}! Tu pedido de menú para la semana ${semana} en ${empresa} ha sido confirmado con el Chef."`)
    console.log('======================================================\n')

    return { success: true, simulated: true }
  } catch (error) {
    console.error('⚠️ [NotificationService Error]: Error al enviar confirmación de pedido B2B:', error.message)
    return { success: false, error: error.message }
  }
}
