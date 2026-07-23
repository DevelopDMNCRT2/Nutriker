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
      path: '/clientes',
      name: 'Clientes',
      component: () => import('../views/Clientes.vue'),
      meta: { title: 'Clientes' },
    },
    {
      path: '/citas',
      name: 'Citas',
      component: () => import('../views/Citas.vue'),
      meta: { title: 'Citas' },
    },
    {
      path: '/productos',
      name: 'Productos',
      component: () => import('../views/Productos.vue'),
      meta: { title: 'Productos' },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `NutriKer Admin | ${to.meta.title ?? ''}`
  
  const isAuthenticated = localStorage.getItem('admin_logged') === 'true'
  
  if (to.path !== '/login' && !isAuthenticated) {
    // next('/login') // TEMPORALMENTE DESACTIVADO PARA DESARROLLO RÁPIDO
    next()
  } else if (to.path === '/login' && isAuthenticated) {
    next('/usuarios')
  } else {
    next()
  }
})
