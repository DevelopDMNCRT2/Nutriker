# Plan de Implementación - NutriKer (Sistema de Gestión Nutricional y Clínica)

Plan integral para el desarrollo y estructuración del sistema **NutriKer**, abarcando el cliente público, panel de administración, backend serverless y la integración de IA.

---

## User Review Required

> [!IMPORTANT]
> **Priorización en Cliente Público (`client/`):** 
> El desarrollo del cliente se enfocará en el orden estricto indicado en el README:
> 1. Landing Page y Trayectoria / Resultados de la Dra. Karla.
> 2. Agendamiento de Citas en tiempo real.
> 3. E-commerce / Tienda de suplementos y productos.

> [!IMPORTANT]
> **Pasarela de Pago e Integración de Calendario:**
> Se requiere definir el proveedor para la pasarela de pagos (ej. Stripe o MercadoPago) y la sincronización de calendario (ej. Google Calendar o sistema interno de horarios).

---

## Definiciones y Decisiones del Proyecto

> [!NOTE]
> 1. **Pasarela de Pagos:** Por definir por el cliente final (candidato más probable: **MercadoPago**). El desarrollo de la tienda debe ser modular para poder conectar cualquier pasarela fácilmente.
> 2. **Sincronización de Citas / Calendario:** Conexión con **Google Calendar API** para sincronización, pero manteniendo una interfaz y panel de control visual propio y personalizado dentro del sistema (usando FullCalendar en la vista del Admin).
> 3. **Modelo de IA (Fase 2 & Chat Agencial):** Se optará por **Gemini 1.5 / 2.5 Flash** (Google DeepMind). Es el modelo más recomendado por su excelente relación costo-beneficio, velocidad y gran ventana de contexto para procesar expedientes clínicos largos.
> 4. **Identidad Visual y Colores:** Toda la interfaz (tanto en el cliente público como en el panel de administración) debe utilizar la paleta de colores **Verde y Rojo** en coherencia con el logotipo oficial provisto.

## Flujo de Gestión de Pacientes (Estricto)

El ciclo de vida del paciente dentro de la plataforma debe seguir un flujo lineal y estructurado:

1. **Primera Cita (Registro de Datos):**
   * Captura de datos personales y antecedentes generales de interés para la nutrióloga.
   * Sincronización y aprovechamiento de la base de datos robusta de pacientes existente.
2. **Generación del Expediente Clínico:**
   * Con los datos iniciales, se abre el expediente clínico del paciente.
   * Registro de mediciones antropométricas, evolución y notas detalladas.
3. **Generación de Menús Semanales:**
   * Creación del plan alimenticio y menús semanales adaptados específicamente a la información registrada en su expediente clínico.

---

## Proposed Changes

---

### Backend (`server/`)

Estructurar y ampliar la API REST en Node.js/Express para soportar todos los módulos del sistema y el despliegue serverless en Vercel.

#### [NEW] [expedientes.js](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/server/routes/expedientes.js)
* Crear rutas `/api/expedientes` para el expediente clínico digital: antecedentes, notas de consulta y seguimiento de mediciones antropométricas (peso, grasa, músculo).

#### [NEW] [menus.js](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/server/routes/menus.js)
* Crear rutas `/api/menus` para la creación, asignación y consulta de menús semanales por paciente.

#### [NEW] [zonasEnvio.js](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/server/routes/zonasEnvio.js)
* Rutas `/api/zonas-envio` para gestionar las zonas y tarifas de entrega del e-commerce.

#### [NEW] [ia.js](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/server/routes/ia.js)
* Ruta `/api/ia/generar-menu` y `/api/ia/sintetizar-notas` para integrar el asistente inteligente (Fase 2 / Chat Agencial).

#### [MODIFY] [schema.sql / migración](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/server/db/schema.sql)
* Actualizar tablas en PostgreSQL Neon:
  * `expedientes_clinicos`
  * `mediciones_antropometricas`
  * `menus_semanales`
  * `zonas_envio`
  * `casos_exito` (antes/después y testimonios)

---

### Cliente Público (`client/`)

Desarrollo iterativo de la aplicación pública en Vue 3 + Tailwind CSS respetando el orden de importancia.

#### [MODIFY] [HomeView.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/client/src/views/HomeView.vue)
* Rediseñar la página principal con enfoque en la marca personal de la Dra. Karla, hero section impactante y propuesta de valor.

#### [MODIFY] [NosotrosView.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/client/src/views/NosotrosView.vue)
* Implementar sección de trayectoria, metodología de trabajo y galería administrable de casos de éxito (antes/después) y testimonios.

#### [MODIFY] [CitasView.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/client/src/views/CitasView.vue)
* Crear un flujo de agendamiento intuitivo (paso a paso: fecha/hora -> datos del paciente -> confirmación) con disponibilidad en tiempo real.

#### [NEW] [TiendaView.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/client/src/views/TiendaView.vue)
* Catálogo de productos de salud y suplementos con filtros, detalle de producto y carrito de compras.

#### [NEW] [PortalPacienteView.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/client/src/views/PortalPacienteView.vue)
* Área privada de pacientes para consultar su historial de mediciones (gráficas de evolución) y descargar sus menús semanales.

---

### Panel de Administración (`admin/`)

Optimizar el dashboard en Vue 3 + TypeScript para la gestión diaria de la clínica.

#### [NEW] [DashboardBuenosDias.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/admin/src/views/DashboardBuenosDias.vue)
* Resumen ejecutivo diario: citas de las próximas horas, tareas pendientes y métricas de desempeño.

#### [NEW] [ExpedienteClinico.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/admin/src/views/ExpedienteClinico.vue)
* Módulo interactivo de expediente clínico con gráficas de evolución física y registro de notas de consulta.

#### [NEW] [ChatAgencial.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/admin/src/views/ChatAgencial.vue)
* Asistente inteligente en tiempo real para tomar notas conversacionales durante la consulta y guardarlas estructuradas en el expediente.

#### [NEW] [GeneradorMenus.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/admin/src/views/GeneradorMenus.vue)
* Creador de menús semanales con opción de sugerencia asistida por IA (Fase 2).

#### [NEW] [ZonasEnvio.vue](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/admin/src/views/ZonasEnvio.vue)
* Administrador de zonas geográficas de entrega y tarifas de envío.

---

## Verification Plan

### Automated Tests
- Ejecutar pruebas sintácticas y de compilación en los 3 proyectos:
  * Backend: `npm test` o validación de rutas con Postman / curl.
  * Admin: `npm run build` para validar verificación de tipos en TypeScript.
  * Client: `npm run build` para validar assets y bundle de producción.

### Manual Verification
1. **Flujo de Agendamiento:** Reservar una cita de prueba desde el cliente y verificar que aparezca en el panel de administración sin solapamiento.
2. **Expediente y Menú:** Crear un expediente de paciente, registrar mediciones y asignarle un menú semanal para verificar su correcta descarga en el Portal del Paciente.
3. **Tienda y Carrito:** Agregar productos al carrito y verificar el cálculo de costos y zonas de envío.
