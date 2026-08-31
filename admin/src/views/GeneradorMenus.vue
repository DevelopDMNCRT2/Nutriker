<template>
  <AdminLayout>
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <router-link to="/pacientes" class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 mb-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Regresar a Pacientes
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
            <span>Generador de Menús Semanales</span>
            <span v-if="paciente" class="text-xl font-medium text-brand-600 dark:text-brand-400">
              — {{ paciente.nombre }}
            </span>
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="abrirModalNuevoMenu"
            class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Menú Semanal
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && menus.length === 0" class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <svg class="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No hay menús semanales registrados para este paciente.</p>
        <button @click="abrirModalNuevoMenu" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Crear primer menú
        </button>
      </div>

      <!-- Lista de menus -->
      <div v-if="!loading && menus.length > 0" class="space-y-4">
        <div
          v-for="menu in menus"
          :key="menu.id"
          class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
        >
          <!-- Encabezado del menú -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer select-none"
               @click="toggleMenu(menu.id)">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ menu.nombre }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Semana del {{ formatFecha(menu.semanaInicio) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click.stop="enviarPorWhatsapp(menu)" class="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors" title="Enviar por WhatsApp">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
              <button @click.stop="enviarPorCorreo(menu)" class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="Enviar por Correo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </button>
              <button @click.stop="imprimirMenu()" class="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors" title="Descargar PDF (Imprimir)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              </button>
              <button @click.stop="editarMenu(menu)" class="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors" title="Editar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click.stop="eliminarMenu(menu.id)" class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Eliminar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
              <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': menuAbierto === menu.id }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Tabla semanal expandible -->
          <div v-show="menuAbierto === menu.id" class="overflow-x-auto">
            <table class="w-full min-w-[700px] text-xs">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800/60">
                  <th class="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28">Tiempo</th>
                  <th v-for="dia in dias" :key="dia.key" class="px-3 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ dia.label }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="tiempo in tiempos" :key="tiempo.key" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{{ tiempo.label }}</td>
                  <td v-for="dia in dias" :key="dia.key" class="px-3 py-3 text-center text-gray-600 dark:text-gray-400">
                    <div v-if="menu[`${dia.key}_${tiempo.key}`]" class="inline-flex flex-col bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-lg px-2 py-1 leading-tight text-left">
                      <!-- Compatibilidad Texto vs JSON -->
                      <span class="font-semibold">{{ typeof menu[`${dia.key}_${tiempo.key}`] === 'object' ? menu[`${dia.key}_${tiempo.key}`]?.nombre : menu[`${dia.key}_${tiempo.key}`] }}</span>
                      <span v-if="typeof menu[`${dia.key}_${tiempo.key}`] === 'object' && menu[`${dia.key}_${tiempo.key}`]?.info_nutricional" class="text-[10px] opacity-70 mt-0.5">
                        🔥 {{ menu[`${dia.key}_${tiempo.key}`].info_nutricional.kcal }} kcal
                      </span>
                    </div>
                    <span v-else class="text-gray-300 dark:text-gray-600">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="menu.notas" class="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Notas:</span> {{ menu.notas }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>

    </div>

    <!-- Modal Nuevo / Editar Menú -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
                  leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modalVisible" class="fixed inset-0 z-40 flex items-start justify-center bg-gray-900/60 backdrop-blur-sm overflow-y-auto py-8">
          <div class="relative w-full max-w-[1200px] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
            <!-- Header modal -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-base font-bold text-gray-900 dark:text-white">
                {{ modoEdicion ? 'Editar Menú Semanal' : 'Nuevo Menú Semanal' }}
              </h2>
              <button @click="cerrarModal" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Cuerpo modal -->
            <div class="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              <!-- Columna Izquierda: Asistente IA -->
              <div class="col-span-1 border-r border-gray-200 dark:border-gray-800 pr-6 flex flex-col h-full max-h-[60vh]">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Asistente IA
                </h3>
                
                <div class="flex-1 overflow-y-auto space-y-3 mb-4 text-xs bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div class="flex gap-2">
                    <div class="w-6 h-6 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center text-brand-600 text-[10px]">🤖</div>
                    <div class="bg-white dark:bg-gray-800 p-2 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      Hola Dra. Escribe instrucciones para generar el menú en base al expediente del paciente (ej. "Dieta de 1500 kcal sin lácteos").
                    </div>
                  </div>
                  <div v-for="(msg, idx) in mensajesIA" :key="idx" class="flex gap-2" :class="msg.rol === 'ia' ? '' : 'flex-row-reverse'">
                    <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]" :class="msg.rol === 'ia' ? 'bg-brand-100 text-brand-600' : 'bg-blue-100 text-blue-600'">{{ msg.rol === 'ia' ? '🤖' : '👩‍⚕️' }}</div>
                    <div class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-pre-wrap" :class="msg.rol === 'ia' ? 'bg-white dark:bg-gray-800 rounded-tl-none' : 'bg-blue-50 dark:bg-blue-900/20 rounded-tr-none'">
                      {{ msg.texto }}
                    </div>
                  </div>
                  
                  <div v-if="generandoIA" class="flex gap-2 animate-pulse">
                    <div class="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[10px]">🤖</div>
                    <div class="bg-white p-2 rounded-lg text-gray-400">Pensando el menú y calculando macros...</div>
                  </div>
                </div>

                <div class="mt-auto relative">
                  <textarea v-model="instruccionIA" @keydown.enter.prevent="generarMenuIA" placeholder="Instrucciones para el menú..." rows="2" class="w-full text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 pr-10 outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"></textarea>
                  <button @click="generarMenuIA" :disabled="generandoIA || !instruccionIA.trim()" class="absolute right-2 bottom-2 p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  </button>
                </div>
              </div>

              <!-- Columna Derecha: Formulario y Tabla de Platillos -->
              <div class="col-span-1 lg:col-span-3 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <!-- Datos generales -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nombre del Menú *</label>
                    <input v-model="form.nombre" type="text" placeholder="Plan semana 1 - Reducción" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"/>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Semana de Inicio *</label>
                    <input v-model="form.semanaInicio" type="date" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"/>
                  </div>
                </div>

                <!-- Grid de comidas por dia con PlatilloCell -->
                <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-2">
                  <table class="w-full min-w-[900px] text-xs border-separate border-spacing-2">
                    <thead>
                      <tr>
                        <th class="w-20"></th>
                        <th v-for="dia in dias" :key="dia.key" class="text-center font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[12%] pb-2">{{ dia.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="tiempo in tiempos" :key="tiempo.key">
                        <td class="font-semibold text-gray-700 dark:text-gray-300 align-top pt-2">{{ tiempo.label }}</td>
                        <td v-for="dia in dias" :key="dia.key" class="align-top">
                          <PlatilloCell 
                            v-model="form[`${dia.key}_${tiempo.key}`]" 
                            :dia="dia.key" 
                            :tiempo="tiempo.key" 
                            @edit="abrirEditorPlatillo"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Notas -->
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Notas adicionales</label>
                  <textarea v-model="form.notas" rows="2" placeholder="Indicaciones especiales, restricciones, sustituciones..." class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"></textarea>
                </div>
              </div>
            </div>

            <!-- Footer modal -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button @click="cerrarModal" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancelar</button>
              <button @click="guardarMenu" :disabled="saving" class="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50">
                {{ saving ? 'Guardando...' : (modoEdicion ? 'Actualizar Menú' : 'Guardar Menú') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Sub-Modal: Editor de Platillo Individual -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="editorVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 class="font-bold text-gray-900 dark:text-white">Editar: {{ editorMeta.dia }} / {{ editorMeta.tiempo }}</h3>
              <button @click="editorVisible = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div class="p-5 overflow-y-auto space-y-4">
              <!-- Autocompletar desde Catalogo (Opcional si quiero que puedan jalar de catálogo) -->
              <div v-if="catalogoPlatillos.length > 0" class="mb-4">
                <label class="block text-xs font-semibold text-gray-600 mb-1">Buscar en Catálogo</label>
                <select @change="seleccionarDesdeCatalogo" class="w-full p-2 border border-brand-300 rounded-lg bg-brand-50 text-sm">
                  <option value="">-- Seleccionar para autollenar --</option>
                  <option v-for="p in catalogoPlatillos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombre</label>
                <input v-model="editorData.nombre" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Receta</label>
                <textarea v-model="editorData.receta" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Kcal</label>
                  <input v-model.number="editorData.info_nutricional.kcal" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Proteínas (g)</label>
                  <input v-model.number="editorData.info_nutricional.proteinas" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Carbs (g)</label>
                  <input v-model.number="editorData.info_nutricional.carbohidratos" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Grasas (g)</label>
                  <input v-model.number="editorData.info_nutricional.grasas" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
            
            <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800">
              <button @click="editorVisible = false" class="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button @click="guardarPlatilloEditado" class="px-4 py-2 text-sm text-white bg-brand-600 rounded-lg hover:bg-brand-700">Guardar Celda</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PlatilloCell from './PlatilloCell.vue'
import { pacientesApi, menusApi, iaApi } from '@/api/index.js'
import { platillosApi } from '@/api/platillos'

const route = useRoute()
const pacienteId = ref<string>(route.params.pacienteId as string || '')

const loading = ref(true)
const saving = ref(false)
const modalVisible = ref(false)
const modoEdicion = ref(false)
const menuAbierto = ref<string | null>(null)

const generandoIA = ref(false)
const instruccionIA = ref('')
const mensajesIA = ref<{rol: string, texto: string}[]>([])

const paciente = ref<any>(null)
const menus = ref<any[]>([])
const catalogoPlatillos = ref<any[]>([])

const dias = [
  { key: 'lunes',      label: 'Lun' },
  { key: 'martes',     label: 'Mar' },
  { key: 'miercoles',  label: 'Mie' },
  { key: 'jueves',     label: 'Jue' },
  { key: 'viernes',    label: 'Vie' },
  { key: 'sabado',     label: 'Sab' },
  { key: 'domingo',    label: 'Dom' },
]

const tiempos = [
  { key: 'desayuno',    label: 'Desayuno'   },
  { key: 'colacion_am', label: 'Col AM' },
  { key: 'comida',      label: 'Comida'      },
  { key: 'colacion_pm', label: 'Col PM' },
  { key: 'cena',        label: 'Cena'        },
]

const camposMenú = dias.flatMap(d => tiempos.map(t => `${d.key}_${t.key}`))

function formVacio() {
  const base: Record<string, any> = { id: '', nombre: '', semanaInicio: '', notas: '' }
  camposMenú.forEach(c => base[c] = null)
  return base
}

const form = ref<Record<string, any>>(formVacio())

// Sub-editor logic
const editorVisible = ref(false)
const editorMeta = ref({ dia: '', tiempo: '', fieldKey: '' })
const editorData = ref<any>(null)

function abrirEditorPlatillo(ev: { dia: string, tiempo: string, data: any }) {
  editorMeta.value = { 
    dia: dias.find(d => d.key === ev.dia)?.label || ev.dia, 
    tiempo: tiempos.find(t => t.key === ev.tiempo)?.label || ev.tiempo, 
    fieldKey: `${ev.dia}_${ev.tiempo}` 
  }
  // Clone to avoid editing directly until 'Guardar' is pressed
  editorData.value = JSON.parse(JSON.stringify(ev.data))
  if (!editorData.value.info_nutricional) editorData.value.info_nutricional = { kcal:0, proteinas:0, carbohidratos:0, grasas:0, fibra:0 }
  editorVisible.value = true
}

function guardarPlatilloEditado() {
  form.value[editorMeta.value.fieldKey] = editorData.value
  editorVisible.value = false
}

function seleccionarDesdeCatalogo(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (!id) return
  const p = catalogoPlatillos.value.find(x => x.id === id)
  if (p) {
    editorData.value.nombre = p.nombre
    editorData.value.receta = p.receta || ''
    if (p.info_nutricional) {
      editorData.value.info_nutricional = { ...p.info_nutricional }
    }
    if (p.costos) {
      editorData.value.costos = [...p.costos]
    }
  }
}


function formatFecha(fecha: string) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function toggleMenu(id: string) {
  menuAbierto.value = menuAbierto.value === id ? null : id
}

function abrirModalNuevoMenu() {
  modoEdicion.value = false
  form.value = formVacio()
  mensajesIA.value = []
  instruccionIA.value = ''
  modalVisible.value = true
}

function editarMenu(menu: any) {
  modoEdicion.value = true
  const f = formVacio()
  f.id           = menu.id
  f.nombre       = menu.nombre || ''
  f.semanaInicio = menu.semanaInicio || ''
  f.notas        = menu.notas || ''
  camposMenú.forEach(c => { f[c] = menu[c] || null }) // JSON Objects!
  form.value = f
  mensajesIA.value = []
  instruccionIA.value = ''
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}

async function cargarDatos() {
  loading.value = true
  try {
    const id = (route.params.pacienteId as string) || pacienteId.value
    pacienteId.value = id
    const [pacienteRes, menusRes, platillosRes] = await Promise.all([
      pacientesApi.getById(id).catch(() => null),
      menusApi.getByPaciente(id).catch(() => []),
      platillosApi.getAll().catch(() => ({ data: [] }))
    ])
    paciente.value = pacienteRes
    menus.value = menusRes
    catalogoPlatillos.value = platillosRes.data || []
  } catch (err) {
    console.error('Error al cargar datos:', err)
  } finally {
    loading.value = false
  }
}

async function guardarMenu() {
  if (!form.value.nombre || !form.value.semanaInicio) return
  saving.value = true
  try {
    const body: Record<string, any> = {
      pacienteId: pacienteId.value,
      nombre:       form.value.nombre,
      semanaInicio: form.value.semanaInicio,
      notas:        form.value.notas || '',
    }
    camposMenú.forEach(c => { body[c] = form.value[c] || null })

    if (modoEdicion.value && form.value.id) {
      await menusApi.update(form.value.id, body)
    } else {
      await menusApi.create(body)
    }
    await cargarDatos()
    cerrarModal()
  } catch (err: any) {
    console.error('Error al guardar menu:', err)
    alert(err.message || 'Error al guardar el menú')
  } finally {
    saving.value = false
  }
}

async function eliminarMenu(id: string) {
  if (!confirm('¿Eliminar este menú semanal? Esta acción no se puede deshacer.')) return
  try {
    await menusApi.delete(id)
    menus.value = menus.value.filter(m => m.id !== id)
    if (menuAbierto.value === id) menuAbierto.value = null
  } catch (err: any) {
    alert(err.message || 'Error al eliminar el menú')
  }
}

async function generarMenuIA() {
  if (!instruccionIA.value.trim() || generandoIA.value) return
  
  const instruccion = instruccionIA.value
  mensajesIA.value.push({ rol: 'user', texto: instruccion })
  instruccionIA.value = ''
  generandoIA.value = true
  
  try {
    const res = await iaApi.generarMenu({
      pacienteId: pacienteId.value,
      instrucciones: instruccion
    })
    
    // Auto-fill form
    if (res.menu) {
      Object.keys(res.menu).forEach(k => {
        if (form.value[k] !== undefined) form.value[k] = res.menu[k]
      })
      if (res.menu.notas_ia) form.value.notas = res.menu.notas_ia
    }
    
    mensajesIA.value.push({ rol: 'ia', texto: res.respuesta || 'He generado un menú estructurado en JSON. Revísalo a la derecha.' })
    if (!form.value.nombre) form.value.nombre = 'Dieta IA ' + formatFecha(new Date().toISOString().split('T')[0])
    if (!form.value.semanaInicio) form.value.semanaInicio = new Date().toISOString().split('T')[0]

  } catch (err: any) {
    mensajesIA.value.push({ rol: 'ia', texto: 'Hubo un error al generar el menú: ' + err.message })
  } finally {
    generandoIA.value = false
  }
}

function enviarPorWhatsapp(menu: any) {
  const texto = `Hola! Aquí tienes tu menú "${menu.nombre}" para la semana del ${formatFecha(menu.semanaInicio)}.\nRevísalo en tu portal. 😊`
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
  window.open(url, '_blank')
}

function enviarPorCorreo(menu: any) {
  const texto = `Hola!\n\nAdjunto tu menú "${menu.nombre}" para la semana del ${formatFecha(menu.semanaInicio)}.\n\nSaludos,\nNutriKer`
  const url = `mailto:?subject=Tu Menú Semanal NutriKer&body=${encodeURIComponent(texto)}`
  window.open(url, '_blank')
}

function imprimirMenu() {
  window.print()
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
@media print {
  @page {
    size: landscape;
    margin: 10mm;
  }
  
  /* Ocultar elementos no relevantes */
  aside, .admin-sidebar, header, nav, .print-hide, button {
    display: none !important;
  }
  
  /* Solo mostrar el contenido de menús */
  body {
    background-color: white !important;
  }
  
  .overflow-x-auto {
    overflow: visible !important;
  }
  
  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  
  th, td {
    border: 1px solid #cbd5e1 !important;
  }
}
</style>
