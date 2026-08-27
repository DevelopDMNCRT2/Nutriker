# Estado del Proyecto: Nutriker (Agosto 2026)

Este documento refleja el estado actual del sistema (aplicación del paciente, panel administrativo y servidor), validado tras la auditoría técnica y funcional de la fase reciente de desarrollo. El código es estable, funcional y se encuentra respaldado en su respectivo repositorio.

## 1. Auditoría del Código y Estabilidad

El código ha sido revisado y consolidado. Los hallazgos principales de la auditoría técnica son los siguientes:
- **Ausencia de Errores Críticos (Blockers):** No hay errores de ejecución que rompan el sistema. Los flujos de registro, agendamiento y visualización funcionan sin interrupciones.
- **Limpieza de Código Huérfano:** Se han eliminado columnas, tablas intermedias y lógica desactualizada (como el campo `atencion_previa`, `peso` o `estatura` en el registro inicial) que ya no aportan valor a la base de datos de Monex.
- **Optimización de Base de Datos:** Se crearon índices implícitos y scripts de limpieza (`clean_duplicate_phones.js`) para mantener la integridad referencial y asegurar la ausencia de datos duplicados. Las peticiones SQL ahora usan sentencias `UNION` para combinar vistas eficientemente sin crear vistas de base de datos pesadas.
- **Deuda Técnica Menor (Issues):** Existen advertencias de "Lint" estéticas (por ejemplo, tipos `any` en TypeScript o nombres de componentes Vue de una sola palabra) que no afectan el rendimiento ni la estabilidad y se atenderán como tareas de mantenimiento a futuro.

## 2. ¿Qué SI hace el sistema actualmente? (Contexto Funcional)

- **Portal Público (Monex):** Permite a pacientes externos agendar una consulta de 40 minutos (Primera vez) seleccionando fecha y hora disponible.
- **Validación de Integridad:** Bloquea el agendamiento si un paciente intenta registrar el mismo número de teléfono dos veces, o si alguien intenta elegir un horario que ya está ocupado.
- **Filtro Horario Inteligente (CDMX):** Detecta automáticamente la hora local en Ciudad de México (`America/Mexico_City`) y oculta las horas que ya transcurrieron si el paciente intenta agendar el mismo día de la consulta.
- **Seguridad en Datos:** Exige la creación y confirmación de una contraseña al agendar, la cual se guarda de manera segura para habilitar un futuro portal o dashboard interactivo para el paciente.
- **Agenda Centralizada (Administrador):** La Dra. Karla puede ver en su calendario administrativo tanto las citas creadas internamente, como las citas creadas por pacientes de la empresa Monex desde la interfaz pública.
- **Aviso de Privacidad Legal:** Cuenta con una sección estática e integrada con los datos legales de la responsable para cumplir con la ley ARCO, incluyendo una leyenda de aceptación en el formulario de registro.

## 3. ¿Qué AÚN NO hace el sistema? (Próximos Pasos)

Estas son las áreas que todavía no están conectadas y representan los siguientes pasos en la etapa de desarrollo:

- **Fórmulas de Nutrición Antropométrica:** Aún no se han definido ni implementado los algoritmos o fórmulas matemáticas dentro del expediente clínico para el cálculo de IMC, masa magra, etc.
- **Notificaciones Automáticas:** El sistema no envía actualmente correos electrónicos transaccionales ni notificaciones de WhatsApp al paciente ni a la doctora para confirmar o recordar citas.
- **Dashboard del Paciente (Login Público):** Aunque las contraseñas se están guardando, el paciente externo aún no cuenta con un login funcional y un panel donde pueda consultar sus mediciones o menús.

## 4. Registro de Tareas Pendientes (Issues para Github / Backlog)

Para llevar control, documentamos los siguientes *Issues* para futuras iteraciones:

> [!NOTE]
> **Issue #1: Implementación de Fórmulas Antropométricas**
> - *Descripción:* Reunirse con Karla para definir las fórmulas exactas a utilizar en el expediente clínico (Mifflin, Harris-Benedict, etc.) y programar la calculadora automática en el frontend del administrador.

> [!NOTE]
> **Issue #2: Servicio de Notificaciones Transaccionales (WhatsApp/Email)**
> - *Descripción:* Integrar una API (ej. Twilio, Resend, Nodemailer) para disparar confirmaciones asíncronas cuando se inserta una nueva fila en `citas` o `citas_monex`.

> [!NOTE]
> **Issue #3: Creación de Portal Interactivo del Paciente**
> - *Descripción:* Habilitar la autenticación con el correo y contraseña almacenados en `citas_monex` (o migrar a una tabla general de `usuarios`) para que los pacientes puedan acceder a sus métricas nutricionales.

> [!TIP]
> **Issue #4 (Técnico): Resolución de Advertencias TypeScript / Linter**
> - *Descripción:* Corregir los _warnings_ de desarrollo (`Unexpected any`, `Component name should be multi-word`) para asegurar un estándar de código impecable y fuertemente tipado en los módulos administrativos.
