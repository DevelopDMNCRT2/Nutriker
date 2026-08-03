<template>
  <div class="blog-container">
    <!-- Header del Blog -->
    <header class="blog-header">
      <h1 class="blog-title">Blog y Noticias de Salud</h1>
      <p class="blog-subtitle">Consejos de nutrición, artículos de salud y publicaciones de la Dra. Karla.</p>
    </header>

    <!-- Barra de Búsqueda -->
    <div class="blog-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar publicaciones por palabra clave..."
        class="input-search"
      />
    </div>

    <!-- Estado de Carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando publicaciones del blog...</p>
    </div>

    <!-- Sin Publicaciones -->
    <div v-else-if="postsFiltrados.length === 0" class="empty-state">
      <p>No se encontraron artículos publicados en el blog.</p>
    </div>

    <!-- Grid de Artículos -->
    <div v-else class="posts-grid">
      <article v-for="post in postsFiltrados" :key="post.id" class="post-card">
        <div class="post-image-wrapper">
          <img
            v-if="post.imagen_url"
            :src="post.imagen_url"
            :alt="post.titulo"
            class="post-img"
          />
          <div v-else class="post-no-img">NutriKer Blog</div>
        </div>

        <div class="post-info">
          <div class="post-meta">
            <span class="post-date">{{ formatFecha(post.fecha_publicacion || post.created_at) }}</span>
            <span class="post-author">{{ post.autor || 'Dra. Alexa Lora' }}</span>
          </div>

          <h2 class="post-card-title">{{ post.titulo }}</h2>
          <p class="post-card-resumen">{{ post.resumen || 'Haz clic para leer la publicación completa.' }}</p>

          <div class="post-actions">
            <router-link :to="'/blog/' + post.slug" class="btn-leer">
              Leer artículo &rarr;
            </router-link>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const posts = ref([])
const loading = ref(true)
const searchQuery = ref('')

const fetchPosts = async () => {
  try {
    loading.value = true
    const data = await api.get('/public/blog')
    posts.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al obtener posts del blog:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
})

const postsFiltrados = computed(() => {
  if (!searchQuery.value.trim()) return posts.value
  const q = searchQuery.value.toLowerCase().trim()
  return posts.value.filter(p => 
    (p.titulo && p.titulo.toLowerCase().includes(q)) || 
    (p.resumen && p.resumen.toLowerCase().includes(q))
  )
})

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.blog-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.blog-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-main, #111827);
  margin-bottom: 0.5rem;
}

.blog-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.blog-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.input-search {
  width: 100%;
  max-width: 500px;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #6b7280;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
}

.post-image-wrapper {
  height: 200px;
  background-color: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-no-img {
  color: var(--color-primary, #10b981);
  font-weight: 700;
  font-size: 1.1rem;
}

.post-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.post-author {
  font-weight: 600;
  color: var(--color-primary, #10b981);
}

.post-card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.post-card-resumen {
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  flex: 1;
}

.post-actions {
  margin-top: auto;
}

.btn-leer {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-primary, #10b981);
  font-weight: 700;
  text-decoration: none;
  font-size: 0.875rem;
  transition: gap 0.2s;
}

.btn-leer:hover {
  gap: 0.7rem;
}
</style>
