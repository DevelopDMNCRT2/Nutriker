# NutriKer - Sistema de Gestión Nutricional y Clínica 🥗🩺

**NutriKer** es una plataforma web integral full-stack diseñada para la gestión de servicios nutricionales, agendamiento de citas, administración de expedientes clínicos de pacientes y catálogo de productos.

---

## 🛠️ Stack Tecnológico

El proyecto está construido con la siguiente arquitectura:
*   **Frontend (Cliente & Admin):** Vue 3 (Composition API) + Vite + Tailwind CSS + Pinia (State Management) + TS (en Admin).
*   **Backend:** Express.js configurado en modo **Serverless** para despliegue optimizado en Vercel.
*   **Base de Datos:** PostgreSQL alojado en **Neon** (Serverless Postgres).
*   **Servicios Externos:** Cloudinary para almacenamiento de archivos e imágenes.
*   **Identidad Visual:** La paleta de colores corporativos debe enfocarse en **Verde y Rojo** (basado en los colores oficiales del logotipo, reemplazando la paleta teal previa).

---

## 📋 Especificaciones de Funcionalidades (Para Desarrolladores)

### 🟢 1. Cliente Público (`client/`)
El frontend del cliente debe estructurarse y enfocarse en los siguientes tres pilares, listados en **orden estricto de importancia**:

1.  **Trayectoria, Trabajo y Resultados de la Dra. Karla:**
    *   Landing page principal de alto impacto visual orientada al branding personal.
    *   Sección de "Nosotros" y "Trayectoria" detallando su experiencia y metodología.
    *   Casos de éxito, testimonios de pacientes y galería de resultados (antes/después) administrables.
2.  **Agendamiento de Citas:**
    *   Flujo intuitivo para que pacientes nuevos o recurrentes reserven citas.
    *   Integración de horarios disponibles en tiempo real sincronizados con el calendario de la doctora.
3.  **Punto de Venta E-commerce:**
    *   Catálogo de productos de salud y suplementos recomendados por la doctora.
    *   Carrito de compras y pasarela de pago para facilitar la venta directa en línea.

---

### 🔵 2. Panel de Administración (`admin/`)
El panel privado de gestión de la Dra. Karla y su equipo debe implementar las siguientes capacidades:

*   **Gestión de Usuarios (CRUD):** Control de acceso para administradores, personal de apoyo y cuentas de pacientes.
*   **Calendario & Gestión de Citas:**
    *   Visualización interactiva de citas (por día/semana/mes).
    *   Prevención automática de traslapes en horarios de citas.
*   **Sistema de Notificaciones:** Alertas de citas cercanas para el administrador.
*   **Dashboard "Buenos Días":**
    *   Al iniciar sesión, la doctora debe ver un resumen ejecutivo diario.
    *   Incluye tareas del día, citas programadas para las próximas horas y estadísticas rápidas.
*   **E-commerce & Logística:**
    *   Administrador de catálogo de productos (CRUD de productos, precios, categorías, stock).
    *   Administrador de **Zonas de Envío** y costos de entrega.
*   **Expediente Clínico Digital:**
    *   Historial clínico completo por paciente (antecedentes médicos, notas de consulta, evolución).
    *   Seguimiento de mediciones antropométricas (peso, grasa, estatura, etc.) con histórico visual.
*   **Chat Agencial (Asistente de Consulta):**
    *   Chat interactivo en tiempo real con un agente inteligente para tomar notas durante la consulta.
    *   Capacidad de estructurar y sintetizar la conversación para guardarla directamente en el expediente del paciente.
*   **Generador de Menús Semanales:**
    *   Herramienta para diseñar y asignar planes alimenticios y menús semanales a pacientes específicos.

---

### 🔄 3. Flujo de Gestión de Pacientes (Flujo Estricto)
El ciclo de vida y manejo del paciente dentro de la plataforma debe seguir un flujo lineal y estructurado:
1.  **Primera Cita (Registro):** Captura de datos personales, historial clínico inicial y antecedentes generales de interés nutricional. Se sincroniza y aprovecha la base de datos robusta de pacientes existente.
2.  **Generación del Expediente:** Creación formal de su expediente clínico digital para el registro de mediciones antropométricas, evolución física y notas de consulta subsecuentes.
3.  **Generación de Menús:** Creación de menús semanales personalizados y planes alimenticios adaptados a la información registrada en el expediente.

---

### 🔑 4. Portal del Paciente (`client/` / Login)
*   **Acceso Seguro:** Ingreso de pacientes mediante correo electrónico y contraseña.
*   **Perfil de Paciente:** Espacio donde pueden visualizar su historial, expediente de evolución (mediciones) y descargar/consultar sus menús semanales asignados.

---

## 🔮 Fase 2: Inteligencia Artificial (IA)
En el segundo avance del proyecto, se introducirá un **Asistente de IA** integrado para:
*   Apoyar a la Dra. Karla en la generación automatizada de menús semanales personalizados basados en el perfil clínico del paciente (alergias, metas, mediciones antropométricas, etc.).

---

## 📁 Estructura del Repositorio

```text
Nutriker/
├── server/             # API REST (Express.js Serverless + PostgreSQL Neon)
│   ├── api/            # Puntos de entrada serverless para Vercel
│   ├── controllers/    # Lógica de controladores por módulo
│   ├── db/             # Conexión Neon y scripts de migración
│   ├── middleware/     # Middlewares de auth y carga de archivos
│   ├── routes/         # Rutas de la API
│   └── vercel.json     # Configuración para despliegue serverless
│
├── admin/              # Dashboard de Administración (Vue 3 + TS)
│   ├── src/
│   │   ├── views/      # Dashboard, Citas, Clientes, Zonas de Envío, Menús, etc.
│   │   ├── components/ # Componentes de UI, tablas y gráficos
│   │   └── api/        # Servicios de integración HTTP
│   └── vite.config.ts
│
└── client/             # Portal de Clientes & Pacientes (Vue 3 + Pinia)
    ├── src/
    │   ├── views/      # Landing, Trayectoria, Tienda, Agendamiento, Portal de Paciente
    │   ├── stores/     # Pinia stores (auth, carrito, etc.)
    │   └── services/   # Cliente HTTP (Axios)
    └── vite.config.js
```

---

## 🛠️ Instalación y Desarrollo Local

### Requisitos Previos
* Node.js v18+ instalado.
* Cuenta y base de datos activa en **Neon** (Postgres).
* Variables de entorno configuradas en cada módulo.

### Pasos
1.  **Backend (`server/`)**:
    ```bash
    cd server
    npm install
    # Configurar archivo .env con DATABASE_URL, JWT_SECRET, etc.
    npm run migrate  # Configura/actualiza las tablas en Neon
    npm run dev      # Corre localmente
    ```
2.  **Panel de Administración (`admin/`)**:
    ```bash
    cd admin
    npm install
    npm run dev
    ```
3.  **Cliente Público (`client/`)**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
