<template>
  <AdminLayout>
    <div class="w-full max-w-5xl mx-auto pb-12">
      <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Editar Historia Clínica' : 'Registro de Nuevo Paciente' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">Completa el asistente de registro para generar el expediente.</p>
        </div>
      </div>

      <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-6 flex items-center gap-2 shadow-sm border border-rose-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>

      <!-- STEPPER / WIZARD PROGRESS -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col md:flex-row justify-between relative">
          <!-- Connector line -->
          <div class="absolute top-4 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 hidden md:block" style="z-index: 0;"></div>
          <div class="absolute top-4 left-0 h-1 bg-emerald-500 transition-all duration-300 hidden md:block" :style="{ width: ((currentStep - 1) / (totalSteps - 1) * 100) + '%' }" style="z-index: 0;"></div>

          <!-- Step Indicators -->
          <div v-for="step in visibleSteps" :key="step.id" class="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-2 mb-4 md:mb-0" :class="{ 'opacity-50': currentStep < step.id }">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2"
              :class="[
                currentStep === step.id ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : 
                currentStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-400 dark:border-gray-600'
              ]"
            >
              <svg v-if="currentStep > step.id" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else>{{ step.id }}</span>
            </div>
            <span class="text-sm font-semibold" :class="currentStep >= step.id ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- FORM CONTENT -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        
        <!-- STEP 1: Datos Personales -->
        <div v-show="currentStep === 1" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">1. Datos Personales</h2>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-12">
            <div class="md:col-span-8">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre Completo *</label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Ana Sofía Montenegro" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>
            <div class="md:col-span-4">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Edad</label>
              <input v-model.number="form.edad" type="number" min="1" placeholder="Ej. 28" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>
            <div class="md:col-span-4">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Sexo *</label>
              <select v-model="form.sexo" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors">
                <option value="" disabled>Seleccionar sexo</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
            <div class="md:col-span-4">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Teléfono *</label>
              <input v-model="form.telefono" type="text" placeholder="Ej. 5512345678" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>
            <div class="md:col-span-4">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
              <input v-model="form.correo" type="email" placeholder="paciente@ejemplo.com" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>
            <div class="md:col-span-12">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Ocupación</label>
              <input v-model="form.ocupacion" type="text" placeholder="Ej. Arquitecta, Estudiante..." class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>
            <div class="md:col-span-12">
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Motivo de Consulta</label>
              <textarea v-model="form.motivo_consulta" rows="2" placeholder="¿Por qué acude a la clínica hoy?" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors"></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 2: Antecedentes de Salud -->
        <div v-show="currentStep === 2" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">2. Antecedentes de Salud</h2>
          
          <div class="mb-6">
            <label class="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Padecimientos o Síntomas (Selecciona los aplicables)</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <label v-for="padecimiento in listaPadecimientos" :key="padecimiento" class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input type="checkbox" v-model="form.patologiasObj[padecimiento]" class="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ padecimiento }}</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <!-- Química Sanguínea -->
            <div class="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">¿Se ha realizado Química Sanguínea?</label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.bioquimicosObj.tiene" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div v-if="form.bioquimicosObj.tiene" class="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">¿Hace cuánto tiempo?</label>
                  <input v-model="form.bioquimicosObj.fecha" type="text" placeholder="Ej. Hace 2 meses" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Valores de salud relevantes</label>
                  <textarea v-model="form.bioquimicosObj.valores" rows="2" placeholder="Ej. Glucosa 95, Colesterol 210..." class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"></textarea>
                </div>
              </div>
            </div>

            <!-- Medicamentos -->
            <div class="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">¿Toma medicamentos o suplementos?</label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.farmacosObj.toma" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div v-if="form.farmacosObj.toma" class="animate-in fade-in slide-in-from-top-2">
                <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">¿Cuáles?</label>
                <textarea v-model="form.farmacosObj.cuales" rows="4" placeholder="Ej. Omeprazol, Vitamina C, Magnesio..." class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Cirugías -->
          <div class="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">¿Se ha realizado alguna cirugía?</label>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.cirugiaObj.tuvo" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div v-if="form.cirugiaObj.tuvo" class="animate-in fade-in slide-in-from-top-2">
              <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">¿Cuáles cirugías?</label>
              <textarea v-model="form.cirugiaObj.cuales" rows="3" placeholder="Ej. Apendicectomía, Cesárea, Colecistectomía..." class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 3: Antecedentes Ginecológicos (Solo Mujeres) -->
        <div v-show="currentStep === 3 && form.sexo === 'Femenino'" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">3. Antecedentes Ginecológicos</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha de Última Menstruación</label>
              <input v-model="form.ginecologicosObj.fum" type="date" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>

            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">¿Su periodo es regular?</span>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.ginecologicosObj.regular" :value="true" class="text-emerald-500 focus:ring-emerald-500 dark:bg-gray-800" />
                  <span class="text-sm dark:text-gray-300">Sí</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.ginecologicosObj.regular" :value="false" class="text-emerald-500 focus:ring-emerald-500 dark:bg-gray-800" />
                  <span class="text-sm dark:text-gray-300">No</span>
                </label>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Método Anticonceptivo</label>
              <input v-model="form.ginecologicosObj.anticonceptivo" type="text" placeholder="Ej. DIU, Pastillas, Ninguno" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Número de Embarazos</label>
              <input v-model.number="form.ginecologicosObj.embarazos" type="number" min="0" placeholder="0" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors" />
            </div>

            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">¿Está Lactando?</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.ginecologicosObj.lactando" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">¿Ya presentó la menopausia?</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.ginecologicosObj.menopausia" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

          </div>
        </div>

        <!-- STEP 4: Estilo de Vida y Notas -->
        <div v-show="currentStep === 4" class="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">4. Estilo de Vida y Notas</h2>
          
          <div class="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Su actividad diaria (laboral/rutina) es:</label>
              <select v-model="form.estilo_vidaObj.actividad_diaria" class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors">
                <option value="">Seleccionar nivel de actividad</option>
                <option value="Sedentaria">Sedentaria (Mayor parte del tiempo sentado)</option>
                <option value="Ligera">Ligera (Camina un poco, tareas del hogar leves)</option>
                <option value="Moderada">Moderada (De pie mucho tiempo, caminatas regulares)</option>
                <option value="Activa">Activa (Trabajo físico pesado, movimiento constante)</option>
              </select>
            </div>

            <!-- Consumo de Agua -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">¿Cuánta agua consume al día?</label>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <label v-for="lt in ['0.5 L', '1 L', '1.5 L', '2 L', '3 L', '4 L o más']" :key="lt"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center"
                  :class="form.estilo_vidaObj.agua_diaria === lt
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 text-gray-600 dark:text-gray-400'"
                >
                  <input type="radio" v-model="form.estilo_vidaObj.agua_diaria" :value="lt" class="sr-only" />
                  <span class="text-lg">💧</span>
                  <span class="text-sm mt-1">{{ lt }}</span>
                </label>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">¿Practica algún deporte o ejercicio?</label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.estilo_vidaObj.deporte" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              <div v-if="form.estilo_vidaObj.deporte" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">¿Cuál?</label>
                  <input v-model="form.estilo_vidaObj.cual_deporte" type="text" placeholder="Ej. Gimnasio, Natación, Correr" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Frecuencia (veces por semana / tiempo)</label>
                  <input v-model="form.estilo_vidaObj.frecuencia_deporte" type="text" placeholder="Ej. 3 veces por semana, 1 hora" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Notas Médicas Adicionales</label>
              <textarea v-model="form.notas" rows="4" placeholder="Cualquier otra observación relevante sobre el paciente..." class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white transition-colors"></textarea>
            </div>
          </div>
        </div>

      </div>

      <!-- FOOTER NAVIGATION -->
      <div class="mt-6 flex items-center justify-between">
        <button 
          type="button" 
          @click="prevStep" 
          :disabled="currentStep === 1 || saving"
          class="px-6 py-3 rounded-xl font-bold text-sm transition-colors border border-gray-300 dark:border-gray-700"
          :class="currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
        >
          Anterior
        </button>

        <div class="flex gap-4">
          <button 
            type="button" 
            @click="cancelar" 
            class="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          <button 
            v-if="currentStep < totalSteps"
            type="button" 
            @click="nextStep" 
            class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-colors flex items-center gap-2"
          >
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <button 
            v-else
            type="button" 
            @click="guardar" 
            :disabled="saving"
            class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            :class="{ 'opacity-70 cursor-not-allowed': saving }"
          >
            <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {{ isEditing ? 'Actualizar Paciente' : 'Finalizar Registro' }}
          </button>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { pacientesApi } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const errorMsg = ref('')
const pacienteId = computed(() => route.params.id as string)
const isEditing = computed(() => !!pacienteId.value)

// Wizard State
const currentStep = ref(1)

const allSteps = [
  { id: 1, title: 'Personales' },
  { id: 2, title: 'Salud' },
  { id: 3, title: 'Ginecología' },
  { id: 4, title: 'Estilo de Vida' }
]

const visibleSteps = computed(() => {
  if (form.value.sexo !== 'Femenino') {
    // Si no es mujer, el paso 3 se oculta y el 4 pasa a ser el 3.
    // Para simplificar la UI de progreso, filtramos y reenumeramos.
    return [
      { id: 1, title: 'Personales' },
      { id: 2, title: 'Salud' },
      { id: 4, title: 'Estilo de Vida' }
    ]
  }
  return allSteps
})

const totalSteps = computed(() => form.value.sexo === 'Femenino' ? 4 : 4)

const listaPadecimientos = [
  'Hipertrigliceridemia', 'Hipercolesterolemia', 'Alergias', 
  'Gastritis', 'Colitis', 'Reflujo', 
  'Estreñimiento', 'Migrañas o dolor de cabeza', 'Hipertensión arterial'
]

// Form State
const form = ref({
  nombre: '',
  sexo: '',
  telefono: '',
  correo: '',
  edad: null as number | null,
  ocupacion: '',
  cita_id: null as string | null,
  motivo_consulta: '',
  notas: '',
  
  // Objetos temporales para estructurar antes de JSON.stringify
  patologiasObj: {} as Record<string, boolean>,
  bioquimicosObj: { tiene: false, fecha: '', valores: '' },
  farmacosObj: { toma: false, cuales: '' },
  ginecologicosObj: { fum: '', regular: null as boolean | null, anticonceptivo: '', embarazos: null as number | null, lactando: false, menopausia: false },
  cirugiaObj: { tuvo: false, cuales: '' },
  estilo_vidaObj: { actividad_diaria: '', deporte: false, cual_deporte: '', frecuencia_deporte: '', agua_diaria: '' }
})

// Navigation logic
function nextStep() {
  errorMsg.value = ''
  
  if (currentStep.value === 1) {
    if (!form.value.nombre || !form.value.telefono || !form.value.sexo) {
      errorMsg.value = 'Por favor completa Nombre, Sexo y Teléfono para continuar.'
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  let next = currentStep.value + 1
  if (next === 3 && form.value.sexo !== 'Femenino') {
    next = 4 // Saltarse ginecología si no es mujer
  }
  
  currentStep.value = next
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevStep() {
  errorMsg.value = ''
  let prev = currentStep.value - 1
  if (prev === 3 && form.value.sexo !== 'Femenino') {
    prev = 2
  }
  currentStep.value = prev
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await pacientesApi.getById(pacienteId.value)
      if (data) {
        form.value.nombre = data.nombre || ''
        form.value.sexo = data.sexo || ''
        form.value.telefono = data.telefono || ''
        form.value.correo = data.correo || ''
        form.value.edad = data.edad || null
        form.value.ocupacion = data.ocupacion || ''
        form.value.cita_id = data.cita_id || null
        form.value.motivo_consulta = data.motivo_consulta || ''
        form.value.notas = data.notas || ''
        
        // Parsear JSONs si existen
        try { if (data.patologias) form.value.patologiasObj = JSON.parse(data.patologias) } catch(e){}
        try { if (data.bioquimicos) form.value.bioquimicosObj = JSON.parse(data.bioquimicos) } catch(e){}
        try { if (data.farmacos) form.value.farmacosObj = JSON.parse(data.farmacos) } catch(e){}
        try { if (data.ginecologicos) form.value.ginecologicosObj = JSON.parse(data.ginecologicos) } catch(e){}
        try { if (data.estilo_vida) form.value.estilo_vidaObj = JSON.parse(data.estilo_vida) } catch(e){}
        try { if (data.cirugia) form.value.cirugiaObj = JSON.parse(data.cirugia) } catch(e){}
      }
    } catch (e: any) {
      errorMsg.value = 'Error al cargar los datos del paciente'
    }
  } else {
    // Si venimos del calendario de citas, prellenar los datos
    if (route.query.nombre) form.value.nombre = String(route.query.nombre)
    if (route.query.telefono) form.value.telefono = String(route.query.telefono)
    if (route.query.cita_id) form.value.cita_id = String(route.query.cita_id)
  }
})

async function guardar() {
  errorMsg.value = ''
  
  if (!form.value.nombre || !form.value.telefono || !form.value.sexo) {
    errorMsg.value = 'Faltan datos obligatorios del Paso 1.'
    currentStep.value = 1
    return
  }

  saving.value = true
  
  // Preparar payload stringificando objetos JSON
  const payload = {
    ...form.value,
    patologias: JSON.stringify(form.value.patologiasObj),
    bioquimicos: JSON.stringify(form.value.bioquimicosObj),
    farmacos: JSON.stringify(form.value.farmacosObj),
    ginecologicos: form.value.sexo === 'Femenino' ? JSON.stringify(form.value.ginecologicosObj) : null,
    estilo_vida: JSON.stringify(form.value.estilo_vidaObj),
    cirugia: JSON.stringify(form.value.cirugiaObj)
  }

  try {
    if (isEditing.value) {
      await pacientesApi.update(pacienteId.value, payload)
    } else {
      await pacientesApi.create(payload)
    }
    router.push('/pacientes')
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al guardar paciente'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = false
  }
}

function cancelar() {
  router.push('/pacientes')
}
</script>

<style scoped>
/* Transiciones para que los pasos aparezcan suavemente */
.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
