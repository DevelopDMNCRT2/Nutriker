import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/nosotros',
    name: 'Nosotros',
    component: () => import('../views/NosotrosView.vue')
  },
  {
    path: '/tienda',
    name: 'Tienda',
    component: () => import('../views/Tienda.vue')
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('../views/Blog.vue')
  },
  {
    path: '/blog/:slug',
    name: 'BlogPostDetail',
    component: () => import('../views/BlogPostDetail.vue')
  },
  {
    path: '/agendar',
    name: 'Agendar',
    component: () => import('../views/CitasView.vue')
  },
  {
    path: '/portal',
    name: 'Portal',
    component: () => import('../views/Portal.vue')
  },
  {
    path: '/royal-canin',
    name: 'RoyalCanin',
    component: () => import('../views/RoyalCanin.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
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
