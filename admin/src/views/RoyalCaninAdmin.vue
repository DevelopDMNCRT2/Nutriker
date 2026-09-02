<template>
  <AdminLayout>
    <div class="w-full h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <!-- Mismo iframe, pero envuelto en el layout de administración para la doctora -->
      <iframe src="/herramienta-rc/index.html" class="w-full h-full border-0"></iframe>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
