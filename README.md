# NutriKer - Sistema de Gestión Nutricional y Clínica 🥗🩺

**NutriKer** es una plataforma web integral full-stack diseñada para la gestión de servicios nutricionales, agendamiento de citas, administración de expedientes clínicos de pacientes y catálogo de productos.

---

## 🛠️ Stack Tecnológico

El proyecto está construido con la siguiente arquitectura:
*   **Frontend (Cliente & Admin):** Vue 3 (Composition API) + Vite + Tailwind CSS + Pinia (State Management) + TS (en Admin).
*   **Backend:** Express.js configurado en modo **Serverless** para despliegue optimizado en Vercel.
*   **Inteligencia Artificial:** Google Generative AI (Gemini Flash 1.5) SDK para estructuración de consulta clínica y asistente agencial.
*   **Base de Datos:** PostgreSQL alojado en **Neon** (Serverless Postgres).
*   **Integración Continua (CI):** GitHub Actions (`.github/workflows/ci.yml`) para verificación de tipos TypeScript y build automatizado.
*   **Servicios Externos:** Cloudinary para almacenamiento de archivos e imágenes.
*   **Identidad Visual:** La paleta de colores corporativos se enfoca en **Verde y Rojo** (basado en los colores oficiales del logotipo), e icono institucional Apple (`icon_apple.png`).

---

## 📋 Especificaciones de Funcionalidades

### 🟢 1. Cliente Público y API Gateway (`client/` & `server/routes/public.js`)
El frontend del cliente y la capa de servicios públicos integran:

1.  **Trayectoria, Trabajo y Resultados de la Dra. Karla:**
    *   Landing page principal de alto impacto visual orientada al branding personal.
    *   Sección de "Nosotros" y "Trayectoria" detallando su experiencia y metodología.
    *   Casos de éxito, testimonios de pacientes y galería de resultados (antes/después) administrables.
2.  **Agendamiento de Citas — Wizard Interactivo (`client/src/views/CitasView.vue`):**
    *   Proceso guiado de 3 pasos (Tus Datos -> Fecha y Horario -> Resumen y Confirmación).
    *   Validaciones de correo y teléfono de 10 dígitos, selector de fecha/horario en tiempo real y folio de confirmación.
    *   Sincronización instantánea con el backend (`POST /api/public/citas`) guardando citas en la base de datos Neon para el Panel Admin.
3.  **Punto de Venta E-commerce (`client/src/views/Tienda.vue` & `client/src/stores/cart.js`):**
    *   Catálogo dinámico de suplementos y productos recomendados por la doctora con buscador en tiempo real.
    *   Carrito de compras reactivo (Pinia) persistido en `localStorage` con badge de conteo de ítems.
    *   Flujo completo de Checkout con selección de zonas de envío y creación de ordenes sincronizadas con el panel de administración.
4.  **API Gateway Público:**
    *   Endpoints no autenticados (`GET /api/public/productos`, `GET /api/public/zonas-envio`, `POST /api/public/checkout`, `POST /api/public/citas`) para la consulta y creación directa desde la interfaz pública.
5.  **Navegación Global y Estructura de Rutas del Sitio (`client/`):**
    *   Barra de navegación principal (`Navbar.vue`) conectada a Vue Router con enrutamiento dinámico a las 5 secciones oficiales: Inicio (`/`), Acerca de (`/nosotros`), Tienda (`/tienda`), Blog (`/blog`) y Agendar (`/agendar`), con resaltado de la página activa.
6.  **Lector de Blog Público (`client/src/views/Blog.vue` & `BlogPostDetail.vue`):**
    *   Feed dinámico de noticias de salud y nutrición (`/blog`) consumiendo `GET /api/public/blog` con buscador en tiempo real.
    *   Vista detallada de lectura por enlace amigable (`/blog/:slug`) consumiendo `GET /api/public/blog/:slug` con renderizado de contenido enriquecido.

---

### 🔵 2. Panel de Administración (`admin/`)
El panel privado de gestión de la Dra. Karla y su equipo implementa las siguientes capacidades estandarizadas:

*   **Estandarización de Formularios (Vistas Dedicadas Ruteadas):**
    *   Captura y edición de datos integrada en páginas completas de ancho adaptable (`FormSection.vue`) con navegación limpia ruteada en Vue Router, eliminando modales emergentes encimados (*pop-ups*).
*   **Nomenclatura Clínica:**
    *   Interfaz configurada con terminología clínica ("Pacientes" y "Expedientes Clínicos").
*   **Gestión de Usuarios:**
    *   Control de acceso ruteado (`/usuarios/nuevo`, `/usuarios/editar/:id`) para administradores y personal asistencial.
*   **Calendario & Gestión de Citas:**
    *   Visualización interactiva de citas (por día/semana/mes) y gestión dedicada (`/citas/nuevo`, `/citas/editar/:id`) con prevención automática de traslapes en horarios.
*   **Dashboard "Buenos Días":**
    *   Resumen ejecutivo diario con citas programadas para las próximas horas, acceso a expedientes y KPIs.
*   **E-commerce & Logística:**
    *   Catálogo de productos (`/productos/nuevo`, `/productos/editar/:id`) y gestión independiente de categorías (`/categorias/nuevo`, `/categorias/editar/:id`).
    *   Asignación de una o múltiples categorías por producto mediante **Buscador Dinámico de Etiquetas Removibles (*tags*)** optimizado para catálogos extensos y respaldado por PostgreSQL Neon.
    *   Administrador de **Zonas de Envío** y costos de entrega (`/zonas-envio/nuevo`, `/zonas-envio/editar/:id`).
    *   Gestión de **Órdenes de Compra** (`/ordenes/nuevo`) con autocompletado de pacientes registrados.
*   **Expediente Clínico Digital (Pacientes):**
    *   Historial clínico completo por paciente (antecedentes médicos, notas de consulta, evolución) y registro (`/clientes/nuevo`, `/clientes/editar/:id`).
    *   Seguimiento de mediciones antropométricas (peso, grasa, estatura, etc.) con histórico visual.
*   **Chat Agencial (Asistente de Consulta IA):**
    *   Chat interactivo en tiempo real con agente inteligente para tomar notas durante la consulta y guardarlas en el expediente.
*   **Aseguramiento de Calidad & QA de Flujos CRUD:**
    *   Validación integral de persistencia y respuesta libre de errores en la base de datos PostgreSQL Neon para los módulos de Pacientes, Citas, Productos, Categorías, Usuarios, Órdenes y Zonas de Envío.
*   **Generador de Menús Semanales:**
    *   Herramienta para diseñar y asignar planes alimenticios y menús semanales a pacientes específicos.
    *   **Video Tutorial Demostrativo:** [tutorial_generador_menus.mov](file:///Users/yaywiin/Desktop/DEVELOP/Nutriker_Pruebas/docs/media/tutorial_generador_menus.mov) (demostración interactiva del flujo de configuración y asignación de menús por paciente).
*   **Finanzas y Tesorería (Control de Ingresos):**
    *   Control e historial de ingresos del consultorio (`/ingresos`, `/ingresos/nuevo`, `/ingresos/editar/:id`) con métricas KPI (Ingresos Totales, del Mes, Ticket Promedio y Transacciones), autocompletado inteligente de pacientes y generación automática al completar órdenes de venta.
*   **Gestor de Blog y Noticias de Salud (CMS):**
    *   Administración y redacción de artículos clínicos y noticias de salud (`/blog`, `/blog/nuevo`, `/blog/editar/:id`) con editor visual WYSIWYG (estilo Word / Google Docs), botones de formato alternables, generación automática de URLs amigables (slugs) para SEO, subida directa de imágenes desde la computadora a **Cloudinary** y exposición en la API pública (`GET /api/public/blog`).

---

### 🔄 3. Flujo de Gestión de Pacientes (Flujo Estricto)
El ciclo de vida y manejo del paciente dentro de la plataforma sigue un flujo lineal y estructurado:
1.  **Primera Cita (Registro):** Captura de datos personales, historial clínico inicial y antecedentes generales de interés nutricional. Se sincroniza y aprovecha la base de datos de pacientes existente.
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

## ⚙️ Integración Continua (CI)
El proyecto cuenta con un pipeline automatizado en **GitHub Actions** (`.github/workflows/ci.yml`) que se ejecuta en cada Pull Request hacia la rama `main`:
*   **Verificación de Tipos:** Ejecuta `npm run type-check` en `admin/` (`vue-tsc --build`).
*   **Verificación de Compilación:** Valida la construcción del paquete de producción en Vite (`npm run build-only`).
*   **Sintaxis del Servidor:** Comprueba la validez del backend Express (`node --check index.js`).

---

## 🚀 Despliegue Continuo (CD) en Vercel
El proyecto está optimizado para Despliegue Continuo (CD) en **Vercel** mediante la integración nativa con GitHub:
*   **Producción Automática:** Cada fusión (*merge*) a la rama `main` dispara la compilación y publicación serverless en vivo.
*   **Preview Deployments:** Cada Pull Request abierto genera una URL de previsualización para validación visual rápida.
*   **Variables de Entorno:** Configurar en Vercel (*Project Settings > Environment Variables*) las credenciales definidas en los archivos `.env.example`.

---

## 📁 Estructura del Repositorio

```text
Nutriker/
├── server/             # API REST (Express.js Serverless + PostgreSQL Neon)
│   ├── api/            # Puntos de entrada serverless para Vercel
│   ├── controllers/    # Lógica de controladores por módulo
│   ├── db/             # Conexión Neon y scripts de migración
│   ├── middleware/     # Middlewares de auth y carga de archivos
│   ├── routes/         # Rutas de la API (incluyendo /api/public)
│   └── vercel.json     # Configuración para despliegue serverless
│
├── admin/              # Dashboard de Administración (Vue 3 + TS)
│   ├── src/
│   │   ├── views/      # Dashboard, Citas, Pacientes, Productos, Ordenes, FormSection views, etc.
│   │   ├── components/ # Componentes de UI, FormSection, tablas y gráficos
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
    # Configurar archivo .env con DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.
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
