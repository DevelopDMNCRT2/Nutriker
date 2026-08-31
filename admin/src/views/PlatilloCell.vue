<template>
  <div class="relative group">
    <div v-if="typeof modelValue === 'object' && modelValue !== null" class="bg-brand-50/50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-2 text-left relative">
      <p class="text-xs font-semibold text-brand-700 dark:text-brand-300 line-clamp-2 leading-tight pr-6">{{ modelValue.nombre }}</p>
      <div class="flex gap-1 mt-1 text-[10px] text-gray-500">
        <span>🔥 {{ modelValue.info_nutricional?.kcal || 0 }}</span>
        <span>🥩 {{ modelValue.info_nutricional?.proteinas || 0 }}</span>
      </div>
      <button @click="openEditor" class="absolute top-1 right-1 p-1 text-brand-500 hover:text-brand-700 bg-white dark:bg-gray-800 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
      </button>
      <button @click="clear" class="absolute bottom-1 right-1 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    
    <div v-else-if="typeof modelValue === 'string' && modelValue.trim() !== ''" class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-left relative">
      <p class="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-tight pr-6">{{ modelValue }}</p>
      <button @click="convertToRich" class="absolute top-1 right-1 p-1 text-gray-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Convertir a platillo detallado">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
      </button>
      <button @click="clear" class="absolute bottom-1 right-1 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    
    <button v-else @click="openEditor" class="w-full h-12 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: any
  dia: string
  tiempo: string
}>()

const emit = defineEmits(['update:modelValue', 'edit'])

function clear() {
  emit('update:modelValue', null)
}

function openEditor() {
  let val = props.modelValue
  if (typeof val === 'string') {
    val = { nombre: val, receta: '', info_nutricional: { kcal:0, proteinas:0, carbohidratos:0, grasas:0, fibra:0 }, costos: [] }
  } else if (!val) {
    val = { nombre: '', receta: '', info_nutricional: { kcal:0, proteinas:0, carbohidratos:0, grasas:0, fibra:0 }, costos: [] }
  }
  emit('edit', { dia: props.dia, tiempo: props.tiempo, data: val })
}

function convertToRich() {
  openEditor()
}
</script>
