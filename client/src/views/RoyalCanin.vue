<template>
  <div class="royal-canin-presentation">
    <!-- Hero Section -->
    <section class="hero relative overflow-hidden bg-gray-900 text-white min-h-[60vh] flex items-center justify-center">
      <!-- Background Abstract Elements -->
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/40 to-transparent"></div>
        <div class="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-red-600 blur-[120px]"></div>
        <div class="absolute bottom-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-red-700 blur-[100px]"></div>
      </div>
      
      <div class="container relative z-10 mx-auto px-6 text-center">
        <span class="inline-block py-1 px-3 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
          Caso de Éxito Empresarial
        </span>
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Nutrición de Excelencia<br />
          <span class="text-red-500">Royal Canin</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
          Un ecosistema tecnológico completo diseñado para gestionar, producir y entregar nutrición personalizada de alta precisión a gran escala.
        </p>
      </div>
    </section>

    <!-- Modulos Section -->
    <section class="py-24 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Los Tres Pilares del Sistema</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Una arquitectura diseñada para conectar a la nutrióloga, la línea de producción (cocina) y el usuario final, garantizando cero errores en la ejecución.</p>
        </div>

        <div class="space-y-32">
          
          <!-- Módulo 1: Karla (Nutrióloga) -->
          <div class="module-card group">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="order-2 lg:order-1 lg:pr-8">
                <div class="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 mb-4">1. Panel de Karla (Nutrióloga)</h3>
                <p class="text-gray-600 mb-6 leading-relaxed text-lg">
                  El cerebro de la operación. Desde aquí, Karla tiene control absoluto sobre cada perfil clínico de los participantes.
                </p>
                <ul class="space-y-3">
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Diseño de planes nutricionales y cálculo de macronutrientes.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Gestión de raciones, porciones y equivalentes.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Monitoreo de antropometría (peso, grasa) y adherencia al programa.</span>
                  </li>
                </ul>
              </div>
              <div class="order-1 lg:order-2 image-container">
                <img src="/royal/nutriologa.png" alt="Vista Nutrióloga" class="rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
            </div>
          </div>

          <!-- Módulo 2: Chef -->
          <div class="module-card group">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="image-container lg:pl-8">
                <img src="/royal/chef.png" alt="Vista Chef" class="rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <div>
                <div class="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 mb-4">2. Interfaz del Chef (Cocina)</h3>
                <p class="text-gray-600 mb-6 leading-relaxed text-lg">
                  La línea de producción digitalizada. Elimina las hojas de papel y los errores manuales en la preparación de alimentos.
                </p>
                <ul class="space-y-3">
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Recepción de comandas sincronizadas en tiempo real.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Gramajes e instrucciones precisas según cada empleado.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Consolidación de ingredientes para optimizar la producción a escala.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Módulo 3: Empleado -->
          <div class="module-card group">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="order-2 lg:order-1 lg:pr-8">
                <div class="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 mb-4">3. App del Empleado (Participante)</h3>
                <p class="text-gray-600 mb-6 leading-relaxed text-lg">
                  La experiencia de usuario final. Una WebApp optimizada para teléfonos móviles que empodera al participante en su proceso.
                </p>
                <ul class="space-y-3">
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Visualización de plan de comidas del día y progreso.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Confirmación de asistencia o consumo del menú.</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span class="text-gray-700">Apego al tratamiento sin necesidad de descargas ni instalaciones nativas.</span>
                  </li>
                </ul>
              </div>
              <div class="order-1 lg:order-2 image-container text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <img src="/royal/empleado.png" alt="Vista Empleado Móvil" class="mx-auto max-w-[320px] rounded-[2rem] shadow-2xl border-4 border-gray-900 transition-transform duration-700 group-hover:scale-[1.03] group-hover:translate-y-[-10px]" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="bg-red-600 py-20 text-center">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Transformando la Salud Organizacional</h2>
        <p class="text-red-100 text-lg max-w-2xl mx-auto mb-10">Un programa integral apoyado por tecnología punta para cuidar el activo más importante: el equipo de trabajo.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Royal Canin - Herramienta NutriKer'
})
</script>

<style scoped>
.royal-canin-presentation {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

.image-container {
  perspective: 1000px;
}

.module-card {
  position: relative;
}

.module-card::before {
  content: '';
  position: absolute;
  top: -50px;
  bottom: -50px;
  left: -20px;
  right: -20px;
  background: white;
  border-radius: 2rem;
  z-index: -1;
  opacity: 0;
  transform: scale(0.98);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.02);
}

.module-card:hover::before {
  opacity: 1;
  transform: scale(1);
}
</style>
