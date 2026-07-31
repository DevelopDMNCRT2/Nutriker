import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tienda',
    name: 'Tienda',
    component: () => import('../views/Tienda.vue') // Placeholder
  },
  {
    path: '/portal',
    name: 'Portal',
    component: () => import('../views/Portal.vue') // Placeholder
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue') // Placeholder
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
