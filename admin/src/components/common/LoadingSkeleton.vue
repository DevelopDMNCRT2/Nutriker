<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({
  rows: {
    type: Number,
    default: 5
  },
  type: {
    type: String,
    default: 'table' // 'table' | 'cards' | 'list'
  }
})
</script>

<template>
  <!-- Table Skeleton -->
  <div v-if="type === 'table'" class="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
    <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4 mb-6"></div>
    <div v-for="i in rows" :key="i" class="flex items-center space-x-4 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
      <div class="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div class="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-1/4"></div>
      </div>
      <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
    </div>
  </div>

  <!-- Cards Skeleton -->
  <div v-else-if="type === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="i in rows" :key="i" class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div class="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
      <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-1/2"></div>
      <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-20"></div>
      </div>
    </div>
  </div>

  <!-- Generic List Skeleton -->
  <div v-else class="space-y-3 animate-pulse">
    <div v-for="i in rows" :key="i" class="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
  </div>
</template>
