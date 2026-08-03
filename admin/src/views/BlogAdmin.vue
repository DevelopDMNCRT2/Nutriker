<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Gestor de Blog y Noticias de Salud (CMS)
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Administra los artículos clínicos, noticias y consejos nutricionales publicados en la web.
          </p>
        </div>

        <button
          @click="$router.push('/blog/nuevo')"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Redactar Nuevo Artículo</span>
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <select
          v-model="filtroEstado"
          class="w-full sm:w-48 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todos los Estados</option>
          <option value="Publicado">Publicados</option>
          <option value="Borrador">Borradores</option>
          <option value="Archivado">Archivados</option>
        </select>
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por título o autor..."
            class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <!-- Loading Skeleton -->
      <LoadingSkeleton v-if="loading" :rows="4" type="table" />

      <!-- Estado Vacío -->
      <EmptyState
        v-else-if="postsFiltrados.length === 0"
        title="No se encontraron artículos"
        description="No hay publicaciones registradas que coincidan con la búsqueda."
        actionText="Redactar Nuevo Artículo"
        @action="$router.push('/blog/nuevo')"
      />

      <!-- Tabla de Artículos -->
      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-5 py-3.5 font-semibold">Artículo</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Slug (URL)</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Autor</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Fecha de Publicación</th>
                <th scope="col" class="px-5 py-3.5 font-semibold">Estado</th>
                <th scope="col" class="px-5 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="post in postsFiltrados"
                :key="post.id"
                class="hover:bg-gray-50/50 transition-colors dark:hover:bg-gray-800/50"
              >
                <!-- Título e Imagen -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="post.imagen_url"
                      :src="post.imagen_url"
                      alt="Miniatura"
                      class="h-10 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div v-else class="flex h-10 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <span class="font-bold text-gray-900 dark:text-white block max-w-xs truncate">{{ post.titulo }}</span>
                      <span class="text-[11px] text-gray-400 block max-w-xs truncate">{{ post.resumen || 'Sin resumen' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Slug -->
                <td class="px-5 py-4 font-mono text-[11px] text-brand-600 dark:text-brand-400 max-w-xs truncate">
                  /blog/{{ post.slug }}
                </td>

                <!-- Autor -->
                <td class="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                  {{ post.autor }}
                </td>

                <!-- Fecha -->
                <td class="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  {{ post.fecha_publicacion }}
                </td>

                <!-- Estado -->
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    :class="{
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300': post.estado === 'Publicado',
                      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300': post.estado === 'Borrador',
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': post.estado === 'Archivado'
                    }"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {{ post.estado }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      @click="$router.push(`/blog/editar/${post.id}`)"
                      title="Editar artículo"
                      class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmarEliminar(post)"
                      title="Eliminar artículo"
                      class="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import EmptyState from '../components/common/EmptyState.vue'
import { PlusIcon, TrashIcon } from '../icons'
import { blogApi } from '../api'

const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filtroEstado = ref('')

const fetchPosts = async () => {
  try {
    loading.value = true
    posts.value = await blogApi.getAllAdmin()
  } catch (error) {
    console.error('Error al cargar artículos del blog:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
})

const postsFiltrados = computed(() => {
  return posts.value.filter(item => {
    const coincideEstado = !filtroEstado.value || item.estado === filtroEstado.value
    const query = searchQuery.value.toLowerCase().trim()
    const coincideBusqueda = !query ||
      (item.titulo && item.titulo.toLowerCase().includes(query)) ||
      (item.autor && item.autor.toLowerCase().includes(query)) ||
      (item.slug && item.slug.toLowerCase().includes(query))

    return coincideEstado && coincideBusqueda
  })
})

const confirmarEliminar = async (post) => {
  if (confirm(`¿Estás seguro de eliminar el artículo "${post.titulo}"?`)) {
    try {
      await blogApi.delete(post.id)
      await fetchPosts()
    } catch (error) {
      alert('Error al eliminar el artículo: ' + error.message)
    }
  }
}
</script>
