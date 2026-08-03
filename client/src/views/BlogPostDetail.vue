<template>
  <div class="blog-detail-container">
    <div class="blog-detail-content">
      <!-- Botón de regreso -->
      <router-link to="/blog" class="btn-regresar">
        &larr; Regresar al Blog
      </router-link>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <p>Cargando publicación...</p>
      </div>

      <!-- Error / No encontrado -->
      <div v-else-if="error || !post" class="error-state">
        <h2>Artículo no encontrado</h2>
        <p>{{ error || 'La publicación solicitada no existe o ha sido removida.' }}</p>
        <router-link to="/blog" class="btn-home">Ver todas las publicaciones</router-link>
      </div>

      <!-- Contenido del Artículo -->
      <article v-else class="post-article">
        <!-- Encabezado -->
        <header class="post-header">
          <h1 class="post-title">{{ post.titulo }}</h1>
          
          <div class="post-meta">
            <span class="post-author">Por {{ post.autor || 'Dra. Alexa Lora' }}</span>
            <span class="meta-dot">&bull;</span>
            <span class="post-date">{{ formatFecha(post.fecha_publicacion || post.created_at) }}</span>
          </div>
        </header>

        <!-- Imagen de Portada Principal -->
        <div v-if="post.imagen_url" class="post-cover-wrapper">
          <img :src="post.imagen_url" :alt="post.titulo" class="post-cover-img" />
        </div>

        <!-- Resumen Destacado -->
        <div v-if="post.resumen" class="post-resumen-box">
          <p>{{ post.resumen }}</p>
        </div>

        <!-- Cuerpo del Artículo HTML Enriquecido -->
        <div class="post-body markdown-body" v-html="post.contenido_html"></div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const post = ref(null)
const loading = ref(true)
const error = ref('')

const fetchPost = async () => {
  try {
    loading.value = true
    error.value = ''
    const slug = route.params.slug
    const data = await api.get(`/public/blog/${slug}`)
    post.value = data
  } catch (err) {
    console.error('Error al cargar publicación:', err)
    error.value = err.response?.data?.error || 'No se pudo cargar la publicación.'
  } finally {
    loading.value = false
  }
}

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchPost()
})

watch(() => route.params.slug, () => {
  if (route.params.slug) fetchPost()
})
</script>

<style scoped>
.blog-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.btn-regresar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary, #10b981);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: opacity 0.2s;
}

.btn-regresar:hover {
  opacity: 0.8;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #6b7280;
}

.error-state h2 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.btn-home {
  display: inline-block;
  margin-top: 1.5rem;
  background-color: var(--color-primary, #10b981);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
}

.post-header {
  margin-bottom: 2rem;
}

.post-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.post-author {
  font-weight: 600;
  color: var(--color-primary, #10b981);
}

.post-cover-wrapper {
  width: 100%;
  max-height: 450px;
  border-radius: 1.25rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.post-cover-img {
  width: 100%;
  height: 100%;
  max-height: 450px;
  object-fit: cover;
}

.post-resumen-box {
  background-color: #f0fdf4;
  border-left: 4px solid var(--color-primary, #10b981);
  padding: 1.25rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  font-size: 1.05rem;
  color: #166534;
  font-style: italic;
  line-height: 1.6;
}

.post-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
}

/* Estilos de elementos HTML dentro del post */
.post-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.post-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.post-body :deep(p) {
  margin-bottom: 1.25rem;
}

.post-body :deep(ul), .post-body :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.post-body :deep(li) {
  margin-bottom: 0.5rem;
}

.post-body :deep(blockquote) {
  border-left: 4px solid #10b981;
  padding-left: 1rem;
  font-style: italic;
  color: #4b5563;
  margin: 1.5rem 0;
}

.post-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}
</style>
