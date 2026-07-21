# NutriKer - Sistema de Gestión Nutricional y Clínica 🥗🩺

**NutriKer** es una plataforma web integral full-stack diseñada para la gestión de servicios nutricionales, agendamiento de citas, administración de expedientes clínicos de pacientes y catálogo de productos.

---

## 📌 Estado Actual del Proyecto

El proyecto se encuentra en una **etapa avanzada de desarrollo y consolidación de funcionalidades clave**, con rebranding total aplicado y arquitectura modular funcional.

### 🟢 1. Servidor Backend (`server/`)
* **Tecnología:** Node.js (ES Modules) + Express.js + PostgreSQL.
* **Autenticación & Seguridad:** Autenticación JWT (`jsonwebtoken`) y encriptación de contraseñas con `bcrypt`.
* **Almacenamiento:** Integración con Cloudinary (`multer-storage-cloudinary`) para la gestión de imágenes y cargas de archivos.
* **Base de Datos & Migraciones:** Scripts de migración modularizados en `db/` (`migrate_all.js`, `migrate_citas.js`, `migrate_productos.js`, `migrate_categorias.js`, etc.) y scripts de alteración de tablas (`alter_citas_add_horario.js`).
* **Endpoints Activos:**
  * `/api/auth`: Inicio de sesión y autenticación.
  * `/api/usuarios`: Gestión de usuarios del sistema.
  * `/api/clientes`: Expedientes clínicos y registros de pacientes.
  * `/api/citas`: Agendamiento, horarios y estados de citas.
  * `/api/productos` & `/api/categorias`: Catálogo y categorías de productos.
  * `/api/pedidos`: Gestión de pedidos.
* **CORS & Despliegue:** Configurado para consumo local y producción en Vercel.

### 🟢 2. Panel de Administración (`admin/`)
* **Tecnología:** Vue 3 (Composition API) + TypeScript + Vite + Tailwind CSS.
* **Identidad Visual:** Rebranding aplicado con paleta de color teal (`#33AAAE`) y tipografía/iconografía con `lucide-vue-next`.
* **Módulos Principales:**
  * **Calendario de Citas (`Citas.vue`):** Integración completa con `FullCalendar` (`@fullcalendar/vue3`), visualización interactiva por día/semana/mes, selector de horario con prevención de traslapes y validación de conflictos.
  * **Expediente Clínico y Pacientes (`Clientes.vue` & `Usuarios.vue`):** CRUD completo para el registro de pacientes con datos antropométricos (peso, estatura), antecedentes médicos y motivo de consulta.
  * **Dashboard Estadístico (`Ecommerce.vue`):** Métricas visuales e integración de gráficas dinámicas con ApexCharts (`vue3-apexcharts`).

### 🟢 3. Cliente Web Público (`client/`)
* **Tecnología:** Vue 3 + Vite + Pinia (State Management) + Vue Router + Tailwind CSS.
* **Vistas Públicas Integradas:**
  * `HomeView.vue`: Landing page principal con información del centro nutricional y llamados a la acción.
  * `NosotrosView.vue`: Información institucional y equipo profesional.
  * `ServiciosView.vue`: Catálogo detallado de planes nutricionales y servicios clínicos.
  * `ContactoView.vue`: Canales de atención e información de contacto.
  * `CitasView.vue`: Formulario interactivo para agendamiento de citas en tiempo real con validación de franjas horarias disponibles.

---

## 📁 Estructura del Repositorio

```text
Nutriker_Pruebas/
├── server/             # API REST en Node.js + Express
│   ├── controllers/    # Lógica de controladores por módulo
│   ├── db/             # Conexión PostgreSQL y scripts de migración
│   ├── middleware/     # Middlewares de auth y carga de archivos
│   ├── routes/         # Definición de rutas API
│   └── index.js        # Punto de entrada de la API
│
├── admin/              # Dashboard de Administración (Vue 3 + TS)
│   ├── src/
│   │   ├── views/      # Vistas principales (Citas, Clientes, Usuarios, etc.)
│   │   ├── components/ # Componentes reutilizables de UI y tablas
│   │   └── api/        # Servicios de integración con el backend
│   └── vite.config.ts  # Configuración de Vite + Tailwind
│
└── client/             # Portal Público para Clientes (Vue 3 + Pinia)
    ├── src/
    │   ├── views/      # Páginas (Home, Servicios, Citas, etc.)
    │   ├── stores/     # Gestión de estado global con Pinia
    │   └── services/   # Cliente HTTP (Axios) para conectar con la API
    └── vite.config.js  # Configuración de Vite
```

---

## 🛠️ Requisitos e Instalación Local

### Requisitos Previos
* Node.js v18 o superior.
* PostgreSQL configurado (o instancia en la nube / Supabase / Render / Neon).

### Pasos para Ejecutar el Proyecto

#### 1. Backend (`server/`)
```bash
cd server
npm install
# Asegurarse de configurar las variables de entorno en .env (DB_URL, JWT_SECRET, CLOUDINARY, etc.)
npm run migrate # Ejecuta las migraciones de base de datos
npm run dev     # Inicia el servidor en http://localhost:3000
```

#### 2. Panel de Administración (`admin/`)
```bash
cd admin
npm install
npm run dev     # Inicia el dashboard en http://localhost:5173 (o puerto asignado por Vite)
```

#### 3. Cliente Público (`client/`)
```bash
cd client
npm install
npm run dev     # Inicia el sitio público para pacientes
```

---

## 🚀 Próximos Pasos / Hoja de Ruta

- [ ] Optimización de políticas CORS y refinamiento de tokens de refresco.
- [ ] Ampliación de notificaciones automáticas para recordatorios de citas.
- [ ] Exportación de expedientes clínicos a formato PDF.
- [ ] Auditoría y actualización fina de dependencias de seguridad.
