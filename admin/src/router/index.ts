import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/Signin.vue'),
      meta: { title: 'Iniciar Sesión' },
    },
    {
      path: '/reservar',
      name: 'AgendarPublico',
      component: () => import('../views/AgendarPublico.vue'),
      meta: { title: 'Reservar Cita - NutriKer' },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardBuenosDias.vue'),
      meta: { title: 'Inicio / Buenos Días' },
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: () => import('../views/Usuarios.vue'),
      meta: { title: 'Usuarios' },
    },
    {
      path: '/usuarios/nuevo',
      name: 'UsuarioCrear',
      component: () => import('../views/UsuarioForm.vue'),
      meta: { title: 'Nuevo Usuario' },
    },
    {
      path: '/usuarios/editar/:id',
      name: 'UsuarioEditar',
      component: () => import('../views/UsuarioForm.vue'),
      meta: { title: 'Editar Usuario' },
    },
    {
      path: '/pacientes',
      name: 'Pacientes',
      component: () => import('../views/Pacientes.vue'),
      meta: { title: 'Pacientes' },
    },
    {
      path: '/pacientes/nuevo',
      name: 'PacienteCrear',
      component: () => import('../views/PacienteForm.vue'),
      meta: { title: 'Nuevo Paciente' },
    },
    {
      path: '/pacientes/editar/:id',
      name: 'PacienteEditar',
      component: () => import('../views/PacienteForm.vue'),
      meta: { title: 'Editar Paciente' },
    },
    {
      path: '/citas',
      name: 'Citas',
      component: () => import('../views/Citas.vue'),
      meta: { title: 'Citas' },
    },
    {
      path: '/citas/nuevo',
      name: 'CitaCrear',
      component: () => import('../views/CitaForm.vue'),
      meta: { title: 'Nueva Cita' },
    },
    {
      path: '/citas/editar/:id',
      name: 'CitaEditar',
      component: () => import('../views/CitaForm.vue'),
      meta: { title: 'Editar Cita' },
    },
    {
      path: '/productos',
      name: 'Productos',
      component: () => import('../views/Productos.vue'),
      meta: { title: 'Productos' },
    },
    {
      path: '/productos/nuevo',
      name: 'ProductoCrear',
      component: () => import('../views/ProductoForm.vue'),
      meta: { title: 'Nuevo Producto' },
    },
    {
      path: '/productos/editar/:id',
      name: 'ProductoEditar',
      component: () => import('../views/ProductoForm.vue'),
      meta: { title: 'Editar Producto' },
    },
    {
      path: '/categorias/nuevo',
      name: 'CategoriaCrear',
      component: () => import('../views/CategoriaForm.vue'),
      meta: { title: 'Nueva Categoría' },
    },
    {
      path: '/categorias/editar/:id',
      name: 'CategoriaEditar',
      component: () => import('../views/CategoriaForm.vue'),
      meta: { title: 'Editar Categoría' },
    },
    {
      path: '/ordenes',
      name: 'Ordenes',
      component: () => import('../views/Ordenes.vue'),
      meta: { title: 'Órdenes' },
    },
    {
      path: '/ordenes/nuevo',
      name: 'OrdenCrear',
      component: () => import('../views/OrdenForm.vue'),
      meta: { title: 'Nueva Orden' },
    },
    {
      path: '/zonas-envio',
      name: 'ZonasEnvio',
      component: () => import('../views/ZonasEnvio.vue'),
      meta: { title: 'Zonas de Envío' },
    },
    {
      path: '/zonas-envio/nuevo',
      name: 'ZonaEnvioCrear',
      component: () => import('../views/ZonaEnvioForm.vue'),
      meta: { title: 'Nueva Zona de Envío' },
    },
    {
      path: '/zonas-envio/editar/:id',
      name: 'ZonaEnvioEditar',
      component: () => import('../views/ZonaEnvioForm.vue'),
      meta: { title: 'Editar Zona de Envío' },
    },
    {
      path: '/ingresos',
      name: 'Ingresos',
      component: () => import('../views/Ingresos.vue'),
      meta: { title: 'Finanzas y Tesorería' },
    },
    {
      path: '/ingresos/nuevo',
      name: 'IngresoCrear',
      component: () => import('../views/IngresoForm.vue'),
      meta: { title: 'Nuevo Ingreso' },
    },
    {
      path: '/ingresos/editar/:id',
      name: 'IngresoEditar',
      component: () => import('../views/IngresoForm.vue'),
      meta: { title: 'Editar Ingreso' },
    },
    {
      path: '/menus/:pacienteId?',
      name: 'GeneradorMenus',
      component: () => import('../views/GeneradorMenus.vue'),
      meta: { title: 'Generador de Menus Semanales' },
    },
    {
      path: '/expedientes/:pacienteId?',
      name: 'ExpedienteClinico',
      component: () => import('../views/ExpedienteClinico.vue'),
      meta: { title: 'Expediente Clínico' },
    },
    {
      path: '/chat-agencial',
      name: 'ChatAgencial',
      component: () => import('../views/ChatAgencial.vue'),
      meta: { title: 'Asistente Clínico IA' },
    },
    {
      path: '/blog',
      name: 'BlogAdmin',
      component: () => import('../views/BlogAdmin.vue'),
      meta: { title: 'Gestor de Blog CMS' },
    },
    {
      path: '/blog/nuevo',
      name: 'BlogPostCrear',
      component: () => import('../views/BlogPostForm.vue'),
      meta: { title: 'Nuevo Artículo de Blog' },
    },
    {
      path: '/blog/editar/:id',
      name: 'BlogPostEditar',
      component: () => import('../views/BlogPostForm.vue'),
      meta: { title: 'Editar Artículo de Blog' },
    },
    {
      path: '/royal-canin',
      name: 'RoyalCanin',
      component: () => import('../views/RoyalCanin.vue'),
      meta: { title: 'Royal Canin' },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `NutriKer Admin | ${to.meta.title ?? ''}`
  
  const isAuthenticated = localStorage.getItem('admin_logged') === 'true'
  const userStr = localStorage.getItem('admin_user')
  let userRol = ''
  if (userStr) {
    try {
      userRol = JSON.parse(userStr).rol
    } catch(e) {}
  }
  
  // BLINDAJE FRONTEND PARA RRHH
  if (isAuthenticated && userRol === 'RRHH') {
    const allowedForRRHH = to.path.startsWith('/citas') || to.path === '/login' || to.path === '/royal-canin'
    if (!allowedForRRHH) {
      return next('/citas')
    }
  }
  
  if (to.path !== '/login' && !isAuthenticated) {
    // next('/login') // TEMPORALMENTE DESACTIVADO PARA DESARROLLO RÁPIDO
    next()
  } else if (to.path === '/login' && isAuthenticated) {
    if (userRol === 'RRHH') {
      next('/citas')
    } else {
      next('/usuarios')
    }
  } else {
    next()
  }
})
