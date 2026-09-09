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
 * Formatea la fecha de un platillo al estilo legible del simulador: "Lunes (10 de agosto de 2026)"
 */
function formatearFechaCard(diaSemana, fecha) {
  if (!fecha) return diaSemana
  try {
    const d = new Date(fecha)
    if (isNaN(d.getTime())) return diaSemana
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const dia = d.getUTCDate()
    const mes = meses[d.getUTCMonth()]
    const anio = d.getUTCFullYear()
    return `${diaSemana} (${dia} de ${mes} de ${anio})`
  } catch {
    return diaSemana
  }
}

/**
 * Genera el cuerpo HTML para la confirmación de pedidos semanales B2B estilo Simulador
 */
function generarPlantillaPedidoB2B({ empleadoNombre, semana, platillos = [], empresa = 'Royal Canin' }) {
  const platillosCards = platillos.map(p => {
    const fechaLabel = formatearFechaCard(p.diaSemana, p.fecha)
    const macros = []
    if (p.calorias) macros.push(`${p.calorias} kcal`)
    if (p.proteina) macros.push(`Proteína: ${p.proteina}`)
    if (p.carbohidratos) macros.push(`Carbohidratos: ${p.carbohidratos}`)
    const macrosText = macros.join(' • ') || 'Nutrición clínica balanceada'

    return `
      <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            ${p.imagenUrl ? `
            <td style="width: 68px; vertical-align: middle; padding-right: 14px;">
              <img src="${p.imagenUrl}" alt="${p.platilloNombre}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover; display: block;" />
            </td>` : ''}
            <td style="vertical-align: middle;">
              <div style="font-size: 13px; font-weight: 700; color: #E11D48; margin-bottom: 4px;">
                ${fechaLabel}
              </div>
              <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">
                ${p.platilloNombre || 'Platillo Seleccionado'}
              </div>
              <div style="font-size: 12px; color: #64748B; margin: 0;">
                ${macrosText}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `
  }).join('')

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
      <div style="background: #E11D48; padding: 26px 32px; color: #FFFFFF; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NutriKer</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Nutrición Empresarial • <strong>${empresa}</strong></p>
      </div>

      <!-- Contenido Principal -->
      <div style="padding: 32px;">
        <div style="margin-bottom: 16px;">
          <span style="background: #DCFCE7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block;">
            ✓ Pedido Confirmado
          </span>
        </div>

        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 10px 0; color: #0F172A;">
          ¡Hola, ${empleadoNombre}!
        </h2>
        <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 20px 0;">
          Aquí tienes la selección gastronómica programada para tus entregas de la semana en las instalaciones de ${empresa}:
        </p>

        <!-- Tarjetas de Platillos Seleccionados (Estilo Simulador) -->
        <div style="margin-bottom: 16px;">
          ${platillosCards || '<p style="color: #94A3B8; font-size: 13px; text-align: center;">Platillos registrados para entrega corporativa.</p>'}
        </div>

        <!-- Banner Servicio Confirmado -->
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 14px 18px; border-radius: 12px; margin-top: 18px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #065F46; line-height: 1.5;">
            <strong style="color: #047857;">✓ Servicio Confirmado:</strong> Platillos frescos elaborados directamente en las instalaciones de ${empresa} según tu selección semanal.
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
