<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <router-link to="/" class="flex items-center justify-center gap-2">
        <template v-if="isExpanded || isHovered || isMobileOpen">
          <img src="/images/logo/logo_full.png" alt="NutriKer Logo" class="h-12 w-auto object-contain" />
          <img src="/images/logo/logo_text.png" alt="NutriKer Text" class="h-8 w-auto object-contain" />
        </template>
        <img v-else src="/images/logo/icon_apple.png" alt="NutriKer Icon" class="h-10 w-auto object-contain" />
      </router-link>
    </div>
    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div>
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                Menú
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="item in menuItems" :key="item.name">
                <router-link
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { UserCircleIcon, CalenderIcon, ListIcon, HorizontalDots, ShoppingBagIcon, TruckIcon } from '../../icons'
import BoxCubeIcon from '@/icons/BoxCubeIcon.vue'
import GridIcon from '@/icons/GridIcon.vue'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const { isExpanded, isMobileOpen, isHovered } = useSidebar()

const allMenuItems = [
  { name: 'Inicio',         path: '/dashboard',     icon: GridIcon },
  { name: 'Usuarios',       path: '/usuarios',      icon: UserCircleIcon },
  { name: 'Pacientes',      path: '/pacientes',      icon: ListIcon },
  { name: 'Platillos',      path: '/platillos',      icon: ListIcon },
  { name: 'Citas',          path: '/citas',         icon: CalenderIcon },
  { name: 'Empresas',       path: '/empresas',      icon: BoxCubeIcon },
  // Módulos ocultos temporalmente para el hito actual
  /*
  { name: 'Productos',      path: '/productos',     icon: BoxCubeIcon },
  { name: 'Órdenes',        path: '/ordenes',       icon: ShoppingBagIcon },
  { name: 'Zonas de Envío', path: '/zonas-envio',   icon: TruckIcon },
  { name: 'Finanzas',       path: '/ingresos',      icon: ShoppingBagIcon },
  { name: 'Blog / CMS',        path: '/blog',        icon: ListIcon },
  { name: 'Asistente IA',      path: '/chat-agencial', icon: UserCircleIcon },
  */
]

const userStr = localStorage.getItem('admin_user')
let userRol = ''
if (userStr) {
  try {
    userRol = JSON.parse(userStr).rol
  } catch(e) {}
}

const menuItems = userRol === 'RRHH' 
  ? allMenuItems.filter(item => item.path === '/citas')
  : allMenuItems

const isActive = (path: string) => route.path === path
</script>
