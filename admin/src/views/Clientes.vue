<template>
  <AdminLayout>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white/90">Pacientes (Expedientes)</h2>
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input v-model="searchQuery" type="text" class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white" placeholder="Buscar paciente...">
        </div>
        <button
          @click="abrirAgregar"
          class="w-full sm:w-auto shrink-0 rounded-lg bg-brand-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 transition-colors"
        >
          Agregar Nuevo Paciente
        </button>
      </div>
    </div>

    <!-- Cargador Skeleton -->
    <LoadingSkeleton v-if="cargando" :rows="5" type="table" class="mb-6" />

    <!-- Estado Vacío Ilustrado -->
    <EmptyState
      v-else-if="clientes.length === 0 && !searchQuery"
      title="No hay expedientes clínicos registrados"
      description="Comienza agregando el expediente del primer paciente para dar seguimiento a su historial y antropometría."
      actionText="Agregar Primer Paciente"
      @action="abrirAgregar"
      class="mb-6"
    />

    <!-- Tabla -->
    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] mb-6">
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
            <tr v-if="clientes.length === 0">
              <td colspan="5" class="px-5 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No se encontraron pacientes que coincidan con la búsqueda.
              </td>
            </tr>
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
                  <router-link :to="`/expedientes/${cliente.id}`" class="text-teal-600 hover:text-teal-800 dark:text-teal-400 transition-colors" title="Expediente Clínico">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </router-link>
                  <router-link :to="`/menus/${cliente.id}`" class="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 transition-colors" title="Menú Semanal">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                  </router-link>
                  <button @click="abrirEditar(cliente)" class="text-amber-600 hover:text-amber-800 dark:text-amber-400 transition-colors" title="Editar">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="eliminar(cliente.id)" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 transition-colors" title="Eliminar">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total-records="totalRecords" 
        @change="cambiarPagina" 
      />
    </div>

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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import Pagination from '@/components/common/Pagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import { citasApi, clientesApi } from '@/api/index.js'

const router = useRouter()

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
const isEditing = ref(false)
const guardando = ref(false)
const cargando = ref(false)
const errorGuardado = ref('')

// Expedientes clínicos desde la API
const clientes = ref<any[]>([])

// Búsqueda y Paginación Server-Side
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)
const totalRecords = ref(0)
let searchTimeout: any = null

async function cargarClientes() {
  cargando.value = true
  try {
    const res = await clientesApi.getAll(currentPage.value, itemsPerPage, searchQuery.value)
    clientes.value = res.data || []
    totalPages.value = res.meta?.totalPages || 1
    totalRecords.value = res.meta?.totalRecords || 0
  } catch (e: any) {
    console.error('Error al cargar expedientes:', e.message)
  } finally {
    cargando.value = false
  }
}

function cambiarPagina(page: number) {
  currentPage.value = page
  cargarClientes()
}

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    cargarClientes()
  }, 300)
})

onMounted(cargarClientes)

// Lógica operativa
const abrirAgregar = () => {
  router.push('/clientes/nuevo')
}

const abrirEditar = (cliente: any) => {
  router.push(`/clientes/editar/${cliente.id}`)
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


