<template>
  <AdminLayout>
    <div class="w-full">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Empresas</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Administra las empresas asociadas a NutriKer y accede a sus portales específicos.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Tarjeta: Royal Canin (Activa) -->
        <router-link
          to="/empresas/royal-canin"
          class="group relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-brand-500 dark:bg-gray-800 dark:ring-gray-700 dark:hover:ring-brand-500"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div class="p-6">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 12 2.1 7.1"></path>
                <path d="M12 12l9.9 4.9"></path>
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Royal Canin</h3>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Accede a la herramienta de nutrición, menús y métricas de los participantes de Royal Canin.
            </p>
            <div class="flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400">
              Ver Portal
              <svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Activo
          </div>
        </router-link>

        <!-- Tarjeta: Monex (Deshabilitada) -->
        <div class="relative block overflow-hidden rounded-2xl bg-gray-50 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700 opacity-60 grayscale cursor-not-allowed">
          <div class="p-6">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Monex</h3>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Portal corporativo para la gestión de citas y métricas nutricionales del personal.
            </p>
            <div class="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
              Próximamente
            </div>
          </div>
          <div class="absolute right-4 top-4 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            En Desarrollo
          </div>
        </div>

        <!-- Tarjeta: Casas de Retiro (Deshabilitada) -->
        <div class="relative block overflow-hidden rounded-2xl bg-gray-50 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700 opacity-60 grayscale cursor-not-allowed">
          <div class="p-6">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Casas de Retiro</h3>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Generador de dietas masivas y control nutricional para residentes de la tercera edad.
            </p>
            <div class="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
              Próximamente
            </div>
          </div>
          <div class="absolute right-4 top-4 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            En Desarrollo
          </div>
        </div>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
