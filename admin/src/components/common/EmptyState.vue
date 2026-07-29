<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Sin registros encontrados'
  },
  description: {
    type: String,
    default: 'No hay información disponible en esta sección por el momento.'
  },
  icon: {
    type: String,
    default: 'inbox'
  },
  actionText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm my-4">
    <!-- Icon Container -->
    <div class="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h4 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
      {{ title }}
    </h4>

    <!-- Description -->
    <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
      {{ description }}
    </p>

    <!-- Action CTA -->
    <button
      v-if="actionText"
      @click="handleAction"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <slot name="action-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </slot>
      <span>{{ actionText }}</span>
    </button>
  </div>
</template>
