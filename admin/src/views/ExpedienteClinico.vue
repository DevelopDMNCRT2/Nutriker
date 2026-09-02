<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Regresar & Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <router-link to="/pacientes" class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 mb-1">
            ← Regresar a Expedientes
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
            <span>Expediente Clínico Digital</span>
            <span v-if="paciente && paciente.nombre" class="text-xl font-medium text-brand-600 dark:text-brand-400">
              — {{ paciente.nombre }}
            </span>
          </h1>
        </div>

        <div class="flex items-center gap-3">

          <button
            @click="abrirModalMedicion"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nueva Medición</span>
          </button>
        </div>
      </div>

      <!-- Datos del Paciente (Tarjeta Principal) -->
      <div v-if="paciente" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-6 dark:border-gray-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xl dark:bg-brand-500/10 dark:text-brand-300">
              {{ paciente.nombre ? paciente.nombre.substring(0, 2).toUpperCase() : 'PA' }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ paciente.nombre }}</h2>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>{{ paciente.telefono || 'Sin teléfono' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.correo || 'Sin correo' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.edad ? `${paciente.edad} años` : 'Edad N/D' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>{{ paciente.ocupacion || 'Ocupación N/D' }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <div class="bg-gray-50 p-3 rounded-xl dark:bg-gray-800/50">
              <span class="block text-gray-400 font-medium">Estatura</span>
              <span class="font-bold text-gray-900 dark:text-white text-sm">{{ ultimaEstatura }}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl dark:bg-gray-800/50">
              <span class="block text-gray-400 font-medium">Peso Inicial</span>
              <span class="font-bold text-gray-900 dark:text-white text-sm">{{ paciente.peso ? `${paciente.peso} kg` : 'N/D' }}</span>
            </div>
            <div class="bg-brand-50 p-3 rounded-xl dark:bg-brand-500/10">
              <span class="block text-brand-600 font-medium dark:text-brand-400">Último Peso</span>
              <span class="font-bold text-brand-700 dark:text-brand-300 text-sm">{{ ultimoPeso }} kg</span>
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <h3 class="text-xs font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Resumen de Historia Clínica
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Padecimientos -->
            <div>
              <span class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Padecimientos</span>
              <div v-if="padecimientosActivos.length > 0" class="flex flex-wrap gap-1">
                <span v-for="pad in padecimientosActivos" :key="pad" class="px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-semibold rounded-md border border-red-100 dark:border-red-800">
                  {{ pad }}
                </span>
              </div>
              <p v-else class="text-xs text-gray-400 italic">Ninguno registrado</p>
            </div>

            <!-- Medicamentos -->
            <div>
              <span class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Medicamentos</span>
              <div v-if="farmacosParsed?.toma" class="bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                {{ farmacosParsed.cuales }}
              </div>
              <p v-else class="text-xs text-gray-400 italic">No toma medicamentos</p>
            </div>

            <!-- Ginecología (Mujeres) -->
            <div v-if="paciente.sexo === 'Femenino'">
              <span class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ginecología</span>
              <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li v-if="ginecologiaParsed?.fum"><span class="font-semibold text-gray-500">FUM:</span> {{ ginecologiaParsed.fum }}</li>
                <li v-if="ginecologiaParsed?.anticonceptivo"><span class="font-semibold text-gray-500">Método:</span> {{ ginecologiaParsed.anticonceptivo }}</li>
                <li class="flex gap-1 flex-wrap">
                  <span v-if="ginecologiaParsed?.lactando" class="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] mt-0.5">Lactando</span>
                  <span v-if="ginecologiaParsed?.menopausia" class="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] mt-0.5">Menopausia</span>
                </li>
              </ul>
            </div>

            <!-- Estilo de Vida -->
            <div>
              <span class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Estilo de Vida</span>
              <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li v-if="estiloVidaParsed?.actividad_diaria"><span class="font-semibold text-gray-500">Actividad:</span> {{ estiloVidaParsed.actividad_diaria }}</li>
                <li v-if="estiloVidaParsed?.deporte"><span class="font-semibold text-gray-500">Deporte:</span> {{ estiloVidaParsed.cual_deporte }} <span class="text-gray-400">({{ estiloVidaParsed.frecuencia_deporte }})</span></li>
                <li v-if="!estiloVidaParsed?.deporte"><span class="font-semibold text-gray-400">Sin actividad deportiva</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfica de Evolución Antropométrica (ApexCharts) -->
      <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white">Evolución Histórica de Mediciones</h3>
              <p class="text-xs text-gray-400 mt-0.5">Haz clic en las etiquetas para activar o desactivar cada línea</p>
            </div>
            <!-- Legend / Toggles -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="serie in definicionSeries"
                :key="serie.key"
                @click="toggleSerie(serie.key)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200"
                :style="seriesActivas[serie.key]
                  ? { backgroundColor: serie.color + '18', borderColor: serie.color, color: serie.color }
                  : { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }"
              >
                <span
                  class="w-2 h-2 rounded-full transition-all"
                  :style="{ backgroundColor: seriesActivas[serie.key] ? serie.color : '#d1d5db' }"
                ></span>
                {{ serie.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="px-2 pb-4">
          <div v-if="mediciones.length > 0">
            <apexchart
              type="line"
              height="340"
              :options="opcionesGrafica"
              :series="seriesGráfica"
            />
          </div>
          <div v-else class="py-16 text-center">
            <svg class="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p class="text-sm text-gray-400 font-medium">Sin mediciones para graficar</p>
            <p class="text-xs text-gray-300 mt-1">Registra la primera medición para ver la evolución aquí</p>
          </div>
        </div>
      </div>

      <!-- Tabla Histórica de Mediciones -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Historial de Consultas</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ mediciones.length }} consulta(s) registrada(s) — ordenadas de más reciente a más antigua</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-400 uppercase font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-3 whitespace-nowrap">#</th>
                <th class="px-4 py-3 whitespace-nowrap">Fecha</th>
                <th class="px-4 py-3 whitespace-nowrap">Peso (kg)</th>
                <th class="px-4 py-3 whitespace-nowrap">IMC</th>
                <th class="px-4 py-3 whitespace-nowrap">Riesgo IMC</th>
                <th class="px-4 py-3 whitespace-nowrap">Talla (m)</th>
                <th class="px-4 py-3 whitespace-nowrap">Cintura (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Cadera (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Abdomen (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Muslo (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Brazo relaj. (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Brazo flex. (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Pantorrilla (cm)</th>
                <th class="px-4 py-3 whitespace-nowrap">Observaciones</th>
                <th class="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-if="medicionesOrdenadas.length === 0" class="text-center">
                <td colspan="13" class="py-10 text-gray-400">Sin consultas registradas.</td>
              </tr>
              <tr
                v-for="(m, idx) in medicionesOrdenadas"
                :key="m.id"
                class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-4 py-3 text-gray-400 font-mono">{{ medicionesOrdenadas.length - idx }}</td>
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{{ m.fecha }}</td>
                <td class="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">{{ m.peso ?? '-' }}</td>
                <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{{ m.imc ?? '-' }}</td>
                <td class="px-4 py-3 text-xs font-bold">
                  <span v-if="m.riesgo_imc" :class="{
                    'text-blue-500': m.riesgo_imc === 'Bajo peso',
                    'text-emerald-500': m.riesgo_imc === 'Normal',
                    'text-orange-500': m.riesgo_imc === 'Sobrepeso',
                    'text-red-500': m.riesgo_imc === 'Obesidad'
                  }">{{ m.riesgo_imc }}</span>
                  <span v-else>-</span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ m.talla ?? '-' }}</td>
                <td class="px-4 py-3 text-amber-600 dark:text-amber-400 font-semibold">{{ m.cintura ?? '-' }}</td>
                <td class="px-4 py-3 text-violet-600 dark:text-violet-400 font-semibold">{{ m.cadera ?? '-' }}</td>
                <td class="px-4 py-3 text-pink-600 dark:text-pink-400 font-semibold">{{ m.abdomen ?? '-' }}</td>
                <td class="px-4 py-3 text-cyan-600 dark:text-cyan-400">{{ m.muslo ?? '-' }}</td>
                <td class="px-4 py-3 text-emerald-600 dark:text-emerald-400">{{ m.brazo_relajado ?? '-' }}</td>
                <td class="px-4 py-3 text-orange-600 dark:text-orange-400">{{ m.brazo_flexionado ?? '-' }}</td>
                <td class="px-4 py-3 text-indigo-600 dark:text-indigo-400">{{ m.pantorrilla ?? '-' }}</td>
                <td class="px-4 py-3 text-gray-400 max-w-[140px] truncate">{{ m.observaciones || '-' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- Ver -->
                    <button
                      @click="abrirVerMedicion(m)"
                      title="Ver detalles"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <!-- Editar -->
                    <button
                      @click="abrirEditarMedicion(m)"
                      title="Editar"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <!-- Eliminar -->
                    <button
                      @click="eliminarMedicion(m.id)"
                      title="Eliminar"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Ver / Editar Medición -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalVerEditarVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarVerEditar"></div>
            <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 z-10 max-h-[90vh] overflow-y-auto">

              <!-- Header -->
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">
                  {{ modoModal === 'ver' ? 'Detalle de Medición' : 'Editar Medición' }}
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    v-if="modoModal === 'ver'"
                    @click="modoModal = 'editar'"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Editar
                  </button>
                  <button @click="cerrarVerEditar" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">✕</button>
                </div>
              </div>

              <!-- MODO VER -->
              <div v-if="modoModal === 'ver'" class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div class="bg-brand-50 dark:bg-brand-500/10 rounded-xl p-3 text-center">
                  <span class="block text-[10px] text-brand-500 font-semibold uppercase tracking-wider">Fecha</span>
                  <span class="block text-sm font-bold text-brand-700 dark:text-brand-300 mt-0.5">{{ medicionActual?.fecha }}</span>
                </div>
                <div v-for="campo in camposDetalle" :key="campo.key" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                  <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{{ campo.label }}</span>
                  <span class="block text-sm font-bold text-gray-700 dark:text-gray-200 mt-0.5">
                    {{ medicionActual?.[campo.db] ?? '-' }}
                    <span v-if="medicionActual?.[campo.db]" class="text-xs font-normal">{{ campo.unidad }}</span>
                  </span>
                </div>
                <div v-if="medicionActual?.observaciones" class="col-span-2 sm:col-span-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
                  <span class="font-semibold text-gray-600 dark:text-gray-300">Observaciones: </span>
                  <span class="text-gray-500 dark:text-gray-400">{{ medicionActual.observaciones }}</span>
                </div>
              </div>

              <!-- MODO EDITAR -->
              <div v-if="modoModal === 'editar'" class="space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
                    <input v-model="formEditar.fecha" type="date" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                    <input v-model="formEditar.peso" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Talla (m)</label>
                    <input v-model="formEditar.talla" type="number" step="0.01" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cintura (cm)</label>
                    <input v-model="formEditar.cintura" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cadera (cm)</label>
                    <input v-model="formEditar.cadera" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Abdomen (cm)</label>
                    <input v-model="formEditar.abdomen" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Muslo (cm)</label>
                    <input v-model="formEditar.muslo" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo relajado (cm)</label>
                    <input v-model="formEditar.brazoRelajado" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo flexionado (cm)</label>
                    <input v-model="formEditar.brazoFlexionado" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Pantorrilla (cm)</label>
                    <input v-model="formEditar.pantorrilla" type="number" step="0.1" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                    <input v-model="formEditar.observaciones" type="text" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 mt-2">
                  <button @click="modoModal = 'ver'" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                    Cancelar
                  </button>
                  <button @click="guardarEdicion" :disabled="saving" class="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50">
                    {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Modal Registrar Nueva Medición (Wizard 2 Pasos) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="modalMedicionVisible" class="fixed inset-0 z-99999 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="cerrarModalMedicion"></div>
            <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 z-10 max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Nueva Medición</h3>
                <button @click="cerrarModalMedicion" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
              </div>

              <!-- PASO 1: TOMA DE DATOS -->
              <div v-if="stepMedicion === 1" class="space-y-4 text-xs py-4">
                <p class="text-gray-500 mb-2">Paso 1: Captura de Datos Clínicos</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Consulta *</label>
                    <input v-model="formMedicion.fecha" type="date" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg) *</label>
                    <input v-model="formMedicion.peso" type="number" step="0.1" placeholder="Ej. 72.5" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Talla (m)</label>
                    <input v-model="formMedicion.talla" type="number" step="0.01" placeholder="Ej. 1.68" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo relajado (cm)</label>
                    <input v-model="formMedicion.brazoRelajado" type="number" step="0.1" placeholder="Ej. 28" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Brazo flexionado (cm)</label>
                    <input v-model="formMedicion.brazoFlexionado" type="number" step="0.1" placeholder="Ej. 30" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cintura (cm)</label>
                    <input v-model="formMedicion.cintura" type="number" step="0.1" placeholder="Ej. 84.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Abdomen (cm)</label>
                    <input v-model="formMedicion.abdomen" type="number" step="0.1" placeholder="Ej. 88.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Cadera (cm)</label>
                    <input v-model="formMedicion.cadera" type="number" step="0.1" placeholder="Ej. 97.5" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Muslo (cm)</label>
                    <input v-model="formMedicion.muslo" type="number" step="0.1" placeholder="Ej. 55.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Pantorrilla (cm)</label>
                    <input v-model="formMedicion.pantorrilla" type="number" step="0.1" placeholder="Ej. 38.0" class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                    <input v-model="formMedicion.observaciones" type="text" placeholder="Notas adicionales..." class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800 mt-4">
                  <button @click="cerrarModalMedicion" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                    Cancelar
                  </button>
                  <button @click="stepMedicion = 2" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Siguiente →
                  </button>
                </div>
              </div>

              <!-- PASO 2: RESUMEN Y GUARDAR -->
              <div v-if="stepMedicion === 2" class="space-y-4 text-xs py-4">
                <p class="text-brand-600 font-semibold mb-1 border-l-4 border-brand-500 pl-3 text-sm">Paso 2: Confirmar y guardar</p>
                <p class="text-gray-400 pl-3 mb-4">Revisa los datos capturados. Las fórmulas e índices se integrarán próximamente.</p>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div v-if="formMedicion.peso" class="bg-brand-50 dark:bg-brand-500/10 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-brand-500 font-semibold uppercase tracking-wider">Peso</span>
                    <span class="block text-lg font-bold text-brand-700 dark:text-brand-300 mt-0.5">{{ formMedicion.peso }} <span class="text-xs font-normal">kg</span></span>
                  </div>
                  <div v-if="formMedicion.talla" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Talla</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.talla }} <span class="text-xs font-normal">m</span></span>
                  </div>
                  <div v-if="formMedicion.cintura" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cintura</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.cintura }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.cadera" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cadera</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.cadera }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.abdomen" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Abdomen</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.abdomen }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.muslo" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Muslo</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.muslo }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.brazoRelajado" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Brazo relajado</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.brazoRelajado }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.brazoFlexionado" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Brazo flexionado</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.brazoFlexionado }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                  <div v-if="formMedicion.pantorrilla" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pantorrilla</span>
                    <span class="block text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">{{ formMedicion.pantorrilla }} <span class="text-xs font-normal">cm</span></span>
                  </div>
                </div>

                <div v-if="formMedicion.observaciones" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  <span class="font-semibold text-gray-600 dark:text-gray-300">Observaciones: </span>{{ formMedicion.observaciones }}
                </div>

                <div class="flex justify-between border-t border-gray-100 pt-4 mt-2 dark:border-gray-800">
                  <button @click="stepMedicion = 1" class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                    ← Volver
                  </button>
                  <button @click="guardarMedicion" :disabled="saving" class="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    {{ saving ? 'Guardando...' : 'Guardar Medición' }}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { pacientesApi, expedientesApi } from '@/api/index.js'
import { BarChartIcon, PlusIcon } from '@/icons'
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const route = useRoute()
const pacienteId = ref<string>(route.params.pacienteId as string || '35135447')

const loading = ref(true)
const saving = ref(false)

const paciente = ref<any>(null)
const expediente = ref<any>({})
const mediciones = ref<any[]>([])

const pacienteName = computed(() => paciente.value?.nombre || 'Cargando...')

const modalMedicionVisible = ref(false)
const stepMedicion = ref(1)

const formMedicion = ref({
  fecha: new Date().toISOString().split('T')[0],
  peso: '',
  talla: '',
  brazoRelajado: '',
  brazoFlexionado: '',
  cintura: '',
  abdomen: '',
  cadera: '',
  muslo: '',
  pantorrilla: '',
  observaciones: '',
})

// --- Computed properties para Historia Clínica ---
function parseJSON(str: string | null | undefined) {
  if (!str) return null
  try { return JSON.parse(str) } catch (e) { return null }
}

const patologiasParsed = computed(() => parseJSON(paciente.value?.patologias) || {})
const bioquimicosParsed = computed(() => parseJSON(paciente.value?.bioquimicos) || null)
const farmacosParsed = computed(() => parseJSON(paciente.value?.farmacos) || null)
const ginecologiaParsed = computed(() => parseJSON(paciente.value?.ginecologicos) || null)
const estiloVidaParsed = computed(() => parseJSON(paciente.value?.estilo_vida) || null)

const padecimientosActivos = computed(() => {
  const obj = patologiasParsed.value
  return Object.keys(obj).filter(k => obj[k] === true)
})
// ------------------------------------------------

const ultimoPeso = computed(() => {
  if (mediciones.value.length > 0) {
    return mediciones.value[mediciones.value.length - 1].peso
  }
  return paciente.value?.peso || 'N/D'
})

const ultimaEstatura = computed(() => {
  const meds = [...mediciones.value].reverse() // Buscar desde la más reciente
  const medTalla = meds.find(m => m.talla)
  if (medTalla) return `${medTalla.talla} m`
  return paciente.value?.estatura ? `${paciente.estatura} m` : 'N/D'
})

// Definición de todas las series disponibles con su color y campo de dato
const definicionSeries = [
  { key: 'peso',            label: 'Peso (kg)',         color: '#4A8C5B', campo: 'peso' },
  { key: 'cintura',         label: 'Cintura (cm)',       color: '#D97706', campo: 'cintura' },
  { key: 'cadera',          label: 'Cadera (cm)',        color: '#7C3AED', campo: 'cadera' },
  { key: 'abdomen',         label: 'Abdomen (cm)',       color: '#DB2777', campo: 'abdomen' },
  { key: 'muslo',           label: 'Muslo (cm)',         color: '#0891B2', campo: 'muslo' },
  { key: 'brazoRelajado',   label: 'Brazo relaj. (cm)', color: '#059669', campo: 'brazo_relajado' },
  { key: 'brazoFlexionado', label: 'Brazo flex. (cm)',  color: '#EA580C', campo: 'brazo_flexionado' },
  { key: 'pantorrilla',     label: 'Pantorrilla (cm)',   color: '#6366F1', campo: 'pantorrilla' },
]

// Estado de cada serie (activa/inactiva)
const seriesActivas = ref<Record<string, boolean>>(
  Object.fromEntries(definicionSeries.map(s => [s.key, true]))
)

function toggleSerie(key: string) {
  seriesActivas.value[key] = !seriesActivas.value[key]
}

// Genera las series activas para ApexCharts
const seriesGráfica = computed(() =>
  definicionSeries
    .filter(s => seriesActivas.value[s.key])
    .map(s => ({
      name: s.label,
      color: s.color,
      data: mediciones.value.map(m => {
        const val = m[s.campo]
        return val !== null && val !== undefined && val !== '' ? parseFloat(val) : null
      }),
    }))
)

// Opciones premium para ApexCharts
const opcionesGrafica = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: true,
      tools: { download: true, selection: false, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
    },
    fontFamily: 'Inter, sans-serif',
    animations: { enabled: true, easing: 'easeinout', speed: 600 },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 2.5 },
  markers: {
    size: 5,
    strokeWidth: 2,
    strokeColors: '#fff',
    hover: { size: 8 },
  },
  xaxis: {
    categories: mediciones.value.map(m => m.fecha),
    labels: { style: { colors: '#9CA3AF', fontSize: '11px', fontFamily: 'Inter, sans-serif' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#9CA3AF', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
      formatter: (val: number) => val ? val.toFixed(1) : '',
    },
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  tooltip: {
    theme: 'light',
    shared: true,
    intersect: false,
    style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
    y: { formatter: (val: number) => val !== null && val !== undefined ? `${val.toFixed(1)}` : 'N/D' },
  },
  legend: { show: false }, // La usamos custom
  fill: {
    type: 'gradient',
    gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.1, opacityFrom: 0.15, opacityTo: 0 },
  },
  dataLabels: { enabled: false },
}))

async function cargarExpediente() {
  loading.value = true
  try {
    const targetId = (route.params.pacienteId as string) || pacienteId.value || '35135447'
    pacienteId.value = targetId

    const [pacienteRes, expRes] = await Promise.all([
      pacientesApi.getById(targetId).catch(() => null),
      expedientesApi.getByPaciente(targetId),
    ])

    paciente.value = pacienteRes
    expediente.value = expRes.expediente
    mediciones.value = expRes.mediciones || []
    
    // Auto-abrir el modal si es la primera vez (0 mediciones)
    if (mediciones.value.length === 0) {
      abrirModalMedicion()
    }
  } catch (err) {
    console.error('Error al cargar expediente clínico:', err)
  } finally {
    loading.value = false
  }
}

function abrirModalMedicion() {
  formMedicion.value = {
    fecha: new Date().toISOString().split('T')[0],
    peso: '',
    talla: '',
    brazoRelajado: '',
    brazoFlexionado: '',
    cintura: '',
    abdomen: '',
    cadera: '',
    muslo: '',
    pantorrilla: '',
    observaciones: '',
  }
  stepMedicion.value = 1
  modalMedicionVisible.value = true
}

function cerrarModalMedicion() {
  modalMedicionVisible.value = false
}

// --- Funciones de Cálculo ---
function calcularCalculosAutomaticos(peso: number | null, talla: number | null, cintura: number | null, cadera: number | null, sexo: string) {
  let imc = null, riesgoImc = null, indiceCC = null, riesgoCc = null

  if (peso && talla) {
    imc = Number((peso / (talla * talla)).toFixed(2))
    if (imc < 18.5) riesgoImc = 'Bajo peso'
    else if (imc <= 24.9) riesgoImc = 'Normal'
    else if (imc <= 29.9) riesgoImc = 'Sobrepeso'
    else riesgoImc = 'Obesidad'
  }

  if (cintura && cadera) {
    indiceCC = Number((cintura / cadera).toFixed(2))
    if (sexo === 'Femenino') {
      if (indiceCC <= 0.80) riesgoCc = 'Bajo'
      else if (indiceCC <= 0.85) riesgoCc = 'Moderado'
      else riesgoCc = 'Alto'
    } else {
      if (indiceCC <= 0.95) riesgoCc = 'Bajo'
      else if (indiceCC <= 1.0) riesgoCc = 'Moderado'
      else riesgoCc = 'Alto'
    }
  }

  return { imc, riesgoImc, indiceCC, riesgoCc }
}

async function guardarMedicion() {
  if (!formMedicion.value.peso) return

  saving.value = true
  try {
    const idPaciente = (route.params.pacienteId as string) || pacienteId.value || '22014468'
    const calcs = calcularCalculosAutomaticos(
      parseFloat(formMedicion.value.peso),
      formMedicion.value.talla ? parseFloat(formMedicion.value.talla) : null,
      formMedicion.value.cintura ? parseFloat(formMedicion.value.cintura) : null,
      formMedicion.value.cadera ? parseFloat(formMedicion.value.cadera) : null,
      paciente.value?.sexo || 'Femenino'
    )

    const body = {
      pacienteId: idPaciente,
      fecha: formMedicion.value.fecha || new Date().toISOString().split('T')[0],
      peso: parseFloat(formMedicion.value.peso),
      talla: formMedicion.value.talla ? parseFloat(formMedicion.value.talla) : null,
      brazoRelajado: formMedicion.value.brazoRelajado ? parseFloat(formMedicion.value.brazoRelajado) : null,
      brazoFlexionado: formMedicion.value.brazoFlexionado ? parseFloat(formMedicion.value.brazoFlexionado) : null,
      cintura: formMedicion.value.cintura ? parseFloat(formMedicion.value.cintura) : null,
      abdomen: formMedicion.value.abdomen ? parseFloat(formMedicion.value.abdomen) : null,
      cadera: formMedicion.value.cadera ? parseFloat(formMedicion.value.cadera) : null,
      muslo: formMedicion.value.muslo ? parseFloat(formMedicion.value.muslo) : null,
      pantorrilla: formMedicion.value.pantorrilla ? parseFloat(formMedicion.value.pantorrilla) : null,
      imc: calcs.imc,
      indiceCC: calcs.indiceCC,
      riesgoImc: calcs.riesgoImc,
      riesgoCc: calcs.riesgoCc,
      observaciones: formMedicion.value.observaciones || '',
    }

    await expedientesApi.createMedicion(body)
    await cargarExpediente()
    cerrarModalMedicion()
  } catch (err: any) {
    console.error('Error al guardar medición:', err)
    alert(err.message || 'Error al guardar la medición')
  } finally {
    saving.value = false
  }
}

// --- Mediciones ordenadas de más reciente a más antigua ---
const medicionesOrdenadas = computed(() =>
  [...mediciones.value].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
)

// --- Modal Ver / Editar ---
const modalVerEditarVisible = ref(false)
const modoModal = ref<'ver' | 'editar'>('ver')
const medicionActual = ref<any>(null)
const formEditar = ref<any>({})

const camposDetalle = [
  { key: 'peso',            label: 'Peso',             db: 'peso',             unidad: 'kg' },
  { key: 'talla',           label: 'Talla',            db: 'talla',            unidad: 'm'  },
  { key: 'imc',             label: 'IMC',              db: 'imc',              unidad: '' },
  { key: 'riesgo_imc',      label: 'Riesgo IMC',       db: 'riesgo_imc',       unidad: '' },
  { key: 'indice_cc',       label: 'Índice C/C',       db: 'indice_cc',        unidad: '' },
  { key: 'riesgo_cc',       label: 'Riesgo C/C',       db: 'riesgo_cc',        unidad: '' },
  { key: 'cintura',         label: 'Cintura',          db: 'cintura',          unidad: 'cm' },
  { key: 'cadera',          label: 'Cadera',           db: 'cadera',           unidad: 'cm' },
  { key: 'abdomen',         label: 'Abdomen',          db: 'abdomen',          unidad: 'cm' },
  { key: 'muslo',           label: 'Muslo',            db: 'muslo',            unidad: 'cm' },
  { key: 'brazoRelajado',   label: 'Brazo relajado',   db: 'brazo_relajado',   unidad: 'cm' },
  { key: 'brazoFlexionado', label: 'Brazo flexionado', db: 'brazo_flexionado', unidad: 'cm' },
  { key: 'pantorrilla',     label: 'Pantorrilla',      db: 'pantorrilla',      unidad: 'cm' },
]

function abrirVerMedicion(m: any) {
  medicionActual.value = m
  modoModal.value = 'ver'
  modalVerEditarVisible.value = true
}

function abrirEditarMedicion(m: any) {
  medicionActual.value = m
  formEditar.value = {
    fecha: m.fecha,
    peso: m.peso,
    talla: m.talla,
    cintura: m.cintura,
    cadera: m.cadera,
    abdomen: m.abdomen,
    muslo: m.muslo,
    brazoRelajado: m.brazo_relajado,
    brazoFlexionado: m.brazo_flexionado,
    pantorrilla: m.pantorrilla,
    observaciones: m.observaciones,
  }
  modoModal.value = 'editar'
  modalVerEditarVisible.value = true
}

function cerrarVerEditar() {
  modalVerEditarVisible.value = false
  medicionActual.value = null
}

async function guardarEdicion() {
  if (!medicionActual.value?.id) return
  saving.value = true
  try {
    const calcs = calcularCalculosAutomaticos(
      formEditar.value.peso ? parseFloat(formEditar.value.peso) : null,
      formEditar.value.talla ? parseFloat(formEditar.value.talla) : null,
      formEditar.value.cintura ? parseFloat(formEditar.value.cintura) : null,
      formEditar.value.cadera ? parseFloat(formEditar.value.cadera) : null,
      paciente.value?.sexo || 'Femenino'
    )

    const payload = {
      fecha: formEditar.value.fecha,
      peso: formEditar.value.peso ? parseFloat(formEditar.value.peso) : null,
      talla: formEditar.value.talla ? parseFloat(formEditar.value.talla) : null,
      cintura: formEditar.value.cintura ? parseFloat(formEditar.value.cintura) : null,
      cadera: formEditar.value.cadera ? parseFloat(formEditar.value.cadera) : null,
      abdomen: formEditar.value.abdomen ? parseFloat(formEditar.value.abdomen) : null,
      muslo: formEditar.value.muslo ? parseFloat(formEditar.value.muslo) : null,
      brazoRelajado: formEditar.value.brazoRelajado ? parseFloat(formEditar.value.brazoRelajado) : null,
      brazoFlexionado: formEditar.value.brazoFlexionado ? parseFloat(formEditar.value.brazoFlexionado) : null,
      pantorrilla: formEditar.value.pantorrilla ? parseFloat(formEditar.value.pantorrilla) : null,
      observaciones: formEditar.value.observaciones || '',
      imc: calcs.imc,
      indiceCC: calcs.indiceCC,
      riesgoImc: calcs.riesgoImc,
      riesgoCc: calcs.riesgoCc,
    }

    await expedientesApi.updateMedicion(medicionActual.value.id, payload)
    cerrarVerEditar()
    await cargarExpediente()
  } catch (err: any) {
    alert(err.message || 'Error al guardar los cambios')
  } finally {
    saving.value = false
  }
}

async function eliminarMedicion(id: string) {
  if (!confirm('¿Eliminar esta medición? Esta acción no se puede deshacer.')) return
  try {
    await expedientesApi.deleteMedicion(id)
    await cargarExpediente()
  } catch (err: any) {
    alert(err.message || 'Error al eliminar la medición')
  }
}

watch(
  () => route.params.pacienteId,
  (newId) => {
    if (newId) {
      pacienteId.value = newId as string
      cargarExpediente()
    }
  }
)

onMounted(() => {
  cargarExpediente()
})
</script>
