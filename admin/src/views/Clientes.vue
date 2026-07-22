<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white/90">Clientes (Expedientes)</h2>
      <button
        @click="abrirAgregar"
        class="rounded-lg bg-brand-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 transition-colors"
      >
        Agregar Nuevo
      </button>
    </div>

    <!-- Tabla -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Nombre</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Correo</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Número</p></th>
              <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Edad</p></th>
              <th class="px-5 py-3 text-center sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 uppercase tracking-wider">Acciones</p></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="cliente in clientes"
              :key="cliente.id"
              class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-5 py-4 sm:px-6">
                <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ cliente.nombre }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.correo || 'N/A' }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.telefono }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.edad ? cliente.edad + ' años' : 'N/A' }}</span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <div class="flex justify-center gap-3">
                  <button @click="abrirDetalles(cliente)" class="text-brand-500 hover:text-brand-700 transition-colors" title="Mostrar Detalles">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button @click="abrirEditar(cliente)" class="text-orange-500 hover:text-orange-700 transition-colors" title="Editar">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="eliminar(cliente.id)" class="text-red-500 hover:text-red-700 transition-colors" title="Eliminar">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="clientes.length === 0">
              <td colspan="5" class="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                No hay expedientes clínicos registrados. ¡Agrega el primero!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal Detalles ── -->
    <Modal v-if="modalDetallesVisible" :fullScreenBackdrop="true" @close="cerrarDetalles">
      <template #body>
        <div class="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-800 m-4 mx-auto mt-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <h3 class="mb-5 text-xl font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
            Expediente Clínico del Paciente
          </h3>

          <div class="space-y-6" v-if="clienteSeleccionado">
            
            <!-- 1. Identidad -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
               <h4 class="text-sm font-bold text-brand-500 mb-4 uppercase tracking-wider">1. Identidad General</h4>
               <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Nombre Completo</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.nombre || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Teléfono</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.telefono || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Correo</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.correo || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Edad</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.edad ? clienteSeleccionado.edad + ' años' : '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Ocupación</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.ocupacion || '-' }}</p>
                  </div>
                  <div class="col-span-1 sm:col-span-3">
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Motivo de Consulta</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 min-h-[60px]">{{ clienteSeleccionado.motivo_consulta || 'No se especificó motivo de consulta' }}</p>
                  </div>
               </div>
            </div>

            <!-- 2. Antecedentes -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
               <h4 class="text-sm font-bold text-brand-500 mb-4 uppercase tracking-wider">2. Antecedentes Clínicos</h4>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Patologías</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.patologias || 'Ninguna reportada' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Antecedentes Familiares</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.antecedentes_familiares || 'Ninguno reportado' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Datos Bioquímicos Recientes</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.bioquimicos || 'No presentados' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Fármacos Actuales</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.farmacos || 'No reportados' }}</p>
                  </div>
                  <div class="col-span-1 sm:col-span-2">
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Salud Digestiva</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.digestiva || 'Normal / No especificada' }}</p>
                  </div>
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 3. Antropometría -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
                <h4 class="text-sm font-bold text-brand-500 mb-4 uppercase tracking-wider">3. Antropometría</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Peso</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.peso ? clienteSeleccionado.peso + ' kg' : '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Estatura</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.estatura ? clienteSeleccionado.estatura + ' m' : '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Circunferencias</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.circunferencias || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Composición Corporal</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.composicion || '-' }}</p>
                    </div>
                </div>
              </div>

              <!-- 5. Cita -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
                <h4 class="text-sm font-bold text-brand-500 mb-4 uppercase tracking-wider">5. Cita Solicitada</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Atención Previa</p>
                      <span :class="['inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase', clienteSeleccionado.atencionPrevia === 'si' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700']">
                        {{ clienteSeleccionado.atencionPrevia === 'si' ? 'Sí' : 'No' }}
                      </span>
                    </div>
                    <div></div>
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Fecha</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.fecha || 'Sin asignar' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Horario</p>
                      <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.horario ? clienteSeleccionado.horario + ' hrs' : 'Sin asignar' }}</p>
                    </div>
                </div>
              </div>
            </div>

            <!-- 4. Estilo de Vida y Dieta -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
               <h4 class="text-sm font-bold text-brand-500 mb-4 uppercase tracking-wider">4. Dieta y Estilo de Vida</h4>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div class="col-span-1 sm:col-span-2">
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Recordatorio 24h</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.recordatorio_24h || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Alergias</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.alergias || 'Ninguna' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Consumo de Ultraprocesados</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.ultraprocesados || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Gustos / Aversiones</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.gustos || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Logística de Cocina</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.logistica_cocina || '-' }}</p>
                  </div>
                  <div class="col-span-1 sm:col-span-2">
                    <p class="text-[11px] uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold">Actividad Física / Estilo de Vida</p>
                    <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ clienteSeleccionado.estilo_vida || '-' }}</p>
                  </div>
               </div>
            </div>

          </div>

          <div class="mt-6 flex justify-end">
            <button @click="cerrarDetalles"
              class="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 focus:ring-4 focus:ring-brand-200 transition-colors">
              Cerrar Expediente
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- ── Modal Formulario (Agregar / Editar) ── -->
    <Modal v-if="modalFormVisible" :fullScreenBackdrop="true" @close="cerrarFormulario">
      <template #body>
        <div class="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-800 m-4 mx-auto mt-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <h3 class="mb-5 text-xl font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
            {{ isEditing ? 'Editar Expediente Clínico' : 'Agregar Expediente Clínico' }}
          </h3>

          <form @submit.prevent="guardarCliente" class="space-y-8">
            <!-- Error banner -->
            <div v-if="errorGuardado" class="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <svg class="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>{{ errorGuardado }}</span>
            </div>

            <!-- 1. Identidad -->
            <div>
              <h4 class="text-sm font-semibold text-brand-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">1. Identidad General</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div class="col-span-1 md:col-span-2">
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Nombre Completo *</label>
                  <input v-model="form.nombre" type="text" required placeholder="Ej. Ana Sofía Montenegro" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Edad</label>
                  <input v-model="form.edad" type="number" placeholder="Ej. 30" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Teléfono * <span class="text-xs text-gray-400 font-normal">(10 dígitos)</span></label>
                  <input v-model="form.telefono" type="tel" required maxlength="10" @input="sanitizeTelefono" placeholder="1234567890" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Correo</label>
                  <input v-model="form.correo" type="email" placeholder="ejemplo@correo.com" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Ocupación</label>
                  <input v-model="form.ocupacion" type="text" placeholder="Ej. Arquitecta, Ingeniero..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div class="col-span-1 md:col-span-3">
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Motivo de Consulta *</label>
                  <textarea v-model="form.motivo_consulta" required placeholder="Describe el motivo principal de la consulta nutricional..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 min-h-[80px]"></textarea>
                </div>
              </div>
            </div>

            <!-- 2. Antecedentes -->
            <div>
              <h4 class="text-sm font-semibold text-brand-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">2. Antecedentes</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Patologías Relevantes</label>
                  <textarea v-model="form.patologias" placeholder="Ej. Hipertensión, resistencia a la insulina..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Antecedentes Familiares</label>
                  <textarea v-model="form.antecedentes_familiares" placeholder="Ej. Padre con diabetes tipo 2, madre con HTA..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Farmacos</label>
                  <textarea v-model="form.farmacos" placeholder="Ej. Metformina 500mg, Losartán..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Digestiva</label>
                  <textarea v-model="form.digestiva" placeholder="Ej. Inflamación por las tardes, acidez..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Laboratorios Bioquímicos</label>
                  <input v-model="form.bioquimicos" type="text" placeholder="Ej. Glucosa 98 mg/dL, Triglicéridos 160..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
              </div>
            </div>

            <!-- 3. Antropometría -->
            <div>
              <h4 class="text-sm font-semibold text-brand-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">3. Antropometría</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Peso (kg)</label>
                  <input v-model="form.peso" type="number" step="0.1" placeholder="Ej. 68.5" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Estatura (m)</label>
                  <input v-model="form.estatura" type="number" step="0.01" placeholder="Ej. 1.65" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Circunferencias</label>
                  <input v-model="form.circunferencias" type="text" placeholder="Ej. Cintura: 85cm, Cadera: 98cm" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Composición</label>
                  <input v-model="form.composicion" type="text" placeholder="Ej. 35% grasa corporal" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
              </div>
            </div>

            <!-- 4. Dieta -->
            <div>
              <h4 class="text-sm font-semibold text-brand-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">4. Dieta y Hábitos</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="col-span-1 sm:col-span-2">
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Recordatorio 24h</label>
                  <textarea v-model="form.recordatorio_24h" placeholder="Ej. Desayuno: Huevo y café. Almuerzo: Ensalada con pollo. Cena: Arroz y verdura..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Estilo de vida y Entrenamiento</label>
                  <textarea v-model="form.estilo_vida" placeholder="Ej. Ejercicio 3 días a la semana (pesas), trabajo sedentario..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 h-20"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Alergias Relevantes</label>
                  <input v-model="form.alergias" type="text" placeholder="Ej. Intolerancia a la lactosa, mariscos..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Gustos / Aversiones</label>
                  <input v-model="form.gustos" type="text" placeholder="Ej. Le gusta el aguacate, no tolera el pescado..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Frecuencia alimentos ultraprocesados</label>
                  <input v-model="form.ultraprocesados" type="text" placeholder="Ej. 2 veces por semana, ocasional..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
                 <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Logística de compra/cocina</label>
                  <input v-model="form.logistica_cocina" type="text" placeholder="Ej. Cocina en casa por las noches..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" />
                </div>
              </div>
            </div>

            <!-- 5. Cita -->
            <div>
              <h4 class="text-sm font-semibold text-brand-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">5. Gestión de Cita</h4>
              <div v-if="form.cita_id" class="mb-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Cita sincronizada con el calendario (ID: {{ form.cita_id }}). Al guardar, se actualizará automáticamente.
              </div>
              <div v-else-if="form.fecha && form.horario" class="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Al guardar, esta cita se agregará automáticamente al calendario.
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Atención Previa en Clínica</label>
                  <select v-model="form.atencionPrevia" class="form-input bg-white dark:bg-gray-800">
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Fecha de Cita Reservada</label>
                  <input v-model="form.fecha" type="date" class="form-input" />
                </div>
                <div>
                  <label class="mb-1 block text-[13px] font-medium text-gray-700 dark:text-gray-400">Horario</label>
                  <select v-model="form.horario" class="form-input bg-white dark:bg-gray-800">
                    <option value="">Seleccionar horario</option>
                    <option v-for="h in HORARIOS" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <div class="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button type="button" @click="cerrarFormulario"
                class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button type="submit" :disabled="guardando"
                class="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <svg v-if="guardando" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                {{ guardando ? 'Guardando...' : 'Guardar Expediente' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { citasApi, clientesApi } from '@/api/index.js'

// Horarios disponibles de la clínica (mismo set que el servidor)
const HORARIOS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30'
]

// Inicializador basado estrictamente en el formulario final de CitasModal.vue
const initForm = () => ({
  id: null as string | null,
  cita_id: null as string | null,   // ID de la cita vinculada en la tabla `citas`
  nombre: '',
  telefono: '',
  correo: '',
  edad: '',
  ocupacion: '',
  motivo_consulta: '',
  patologias: '',
  antecedentes_familiares: '',
  bioquimicos: '',
  farmacos: '',
  digestiva: '',
  peso: '',
  estatura: '',
  circunferencias: '',
  composicion: '',
  recordatorio_24h: '',
  alergias: '',
  ultraprocesados: '',
  gustos: '',
  logistica_cocina: '',
  estilo_vida: '',
  fecha: '',
  horario: '',
  atencionPrevia: 'no'
})

// Estado de modales y de la tabla
const form = reactive({ ...initForm() })
const modalFormVisible = ref(false)
const modalDetallesVisible = ref(false)
const isEditing = ref(false)
const guardando = ref(false)
const cargando = ref(false)
const errorGuardado = ref('')
const clienteSeleccionado = ref<any>(null)

// Expedientes clínicos desde la API
const clientes = ref<any[]>([])

async function cargarClientes() {
  cargando.value = true
  try {
    const data = await clientesApi.getAll()
    clientes.value = data
  } catch (e: any) {
    console.error('Error al cargar expedientes:', e.message)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarClientes)

// Lógica operativa
const abrirAgregar = () => {
  isEditing.value = false
  Object.assign(form, initForm())
  modalFormVisible.value = true
}

const abrirEditar = (cliente: any) => {
  isEditing.value = true
  Object.assign(form, { ...initForm(), ...cliente })
  modalFormVisible.value = true
}

const cerrarFormulario = () => {
  modalFormVisible.value = false
}

function sanitizeTelefono() {
  form.telefono = form.telefono.replace(/[^0-9]/g, '').slice(0, 10)
}

const guardarCliente = async () => {
  errorGuardado.value = ''

  if (!form.telefono || form.telefono.length !== 10) {
    errorGuardado.value = 'El teléfono debe contener exactamente 10 dígitos numéricos.'
    return
  }

  guardando.value = true

  try {
    // ── Sincronizar con el calendario de Citas ──────────────────────────
    if (form.fecha && form.horario && form.nombre && form.telefono) {
      const citaPayload = {
        cliente_nombre: form.nombre,
        cliente_telefono: form.telefono,
        fecha: form.fecha,
        horario: form.horario,
        atencion_previa: form.atencionPrevia || 'no',
        peso: form.peso || null,
        estatura: form.estatura || null,
      }

      if (form.cita_id) {
        // Actualizar cita existente
        await citasApi.update(form.cita_id, citaPayload)
      } else {
        // Crear nueva cita y guardar el ID
        const nuevaCita = await citasApi.create(citaPayload)
        form.cita_id = nuevaCita.id
      }
    }

    // ── Persistir expediente en PostgreSQL Neon ───────────────────────
    if (isEditing.value && form.id) {
      await clientesApi.update(form.id, form)
    } else {
      await clientesApi.create(form)
    }

    await cargarClientes()
    cerrarFormulario()
  } catch (e: any) {
    errorGuardado.value = e.message || 'Error al guardar el expediente.'
  } finally {
    guardando.value = false
  }
}

const abrirDetalles = (cliente: any) => {
  clienteSeleccionado.value = { ...cliente }
  modalDetallesVisible.value = true
}

const cerrarDetalles = () => {
  modalDetallesVisible.value = false
}

const eliminar = async (id: string) => {
  if (confirm('¿Estás seguro que deseas eliminar este expediente clínico de forma permanente?')) {
    try {
      await clientesApi.delete(id)
      await cargarClientes()
    } catch (e: any) {
      alert(e.message || 'Error al eliminar expediente')
    }
  }
}
</script>


