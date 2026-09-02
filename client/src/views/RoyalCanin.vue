<template>
  <!-- Contenedor principal con Scroll Snap para efecto de diapositivas -->
  <div class="h-screen w-full overflow-y-auto snap-y snap-mandatory bg-white font-sans">

    <!-- Slide 1: Nutrióloga -->
    <section class="h-screen w-full snap-start flex flex-col lg:flex-row">
      <!-- Mitad Imagen -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#f8f9fa] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent"></div>
        <img src="/royal/nutriologa.png" alt="Nutrióloga" class="relative z-10 w-full max-w-2xl max-h-full object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-200" />
      </div>
      <!-- Mitad Texto -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col justify-center px-8 lg:px-24 bg-white">
        <div class="max-w-xl">
          <span class="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 font-bold tracking-wider uppercase text-xs mb-6 border border-red-100">Módulo 1</span>
          <h2 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">Interfaz de la Nutrióloga</h2>
          <p class="text-xl text-gray-500 mb-10 leading-relaxed font-light">
            El centro de mando clínico. Desde aquí se diseñan los planes nutricionales y se gestiona la evolución de cada participante con precisión.
          </p>
          <ul class="space-y-5">
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Diseño de planes y cálculo de macronutrientes.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Gestión de raciones, porciones y equivalentes.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Monitoreo continuo de antropometría y adherencia.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Slide 2: Chef -->
    <section class="h-screen w-full snap-start flex flex-col lg:flex-row-reverse border-t border-gray-100">
      <!-- Mitad Imagen -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#f8f9fa] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-bl from-red-50/50 to-transparent"></div>
        <img src="/royal/chef.png" alt="Chef" class="relative z-10 w-full max-w-2xl max-h-full object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-200" />
      </div>
      <!-- Mitad Texto -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col justify-center px-8 lg:px-24 bg-white">
        <div class="max-w-xl">
          <span class="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 font-bold tracking-wider uppercase text-xs mb-6 border border-red-100">Módulo 2</span>
          <h2 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">Línea de Producción</h2>
          <p class="text-xl text-gray-500 mb-10 leading-relaxed font-light">
            Elimina el uso de papel y reduce los errores a cero. La cocina recibe las comandas sincronizadas en tiempo real con las dietas.
          </p>
          <ul class="space-y-5">
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Recepción automática de comandas.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Gramajes exactos según las necesidades de cada empleado.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Consolidación de ingredientes para optimizar escalas.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Slide 3: Empleado -->
    <section class="h-screen w-full snap-start flex flex-col lg:flex-row border-t border-gray-100">
      <!-- Mitad Imagen -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#f8f9fa] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent"></div>
        <!-- Ajuste especial para el móvil para que resalte -->
        <img src="/royal/empleado.png" alt="Empleado" class="relative z-10 h-full max-h-[85vh] object-contain rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-[12px] border-gray-900 bg-white" />
      </div>
      <!-- Mitad Texto -->
      <div class="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col justify-center px-8 lg:px-24 bg-white">
        <div class="max-w-xl">
          <span class="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 font-bold tracking-wider uppercase text-xs mb-6 border border-red-100">Módulo 3</span>
          <h2 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">App del Participante</h2>
          <p class="text-xl text-gray-500 mb-10 leading-relaxed font-light">
            La experiencia del usuario final en la palma de su mano. Una herramienta ágil y accesible para acompañarlo en su proceso día a día.
          </p>
          <ul class="space-y-5">
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Visualización clara del plan de comidas del día.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Confirmación de asistencia y consumo.</span>
            </li>
            <li class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-4">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="text-gray-700 text-lg font-medium">Acceso inmediato sin descargas ni instalaciones nativas.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.title = 'Royal Canin - Herramienta NutriKer'
  // Bloquear el scroll del body para que solo el div maneje el snap
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>
