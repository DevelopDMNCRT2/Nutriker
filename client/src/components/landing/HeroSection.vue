<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Transforma tu vida a través de la nutrición</h1>
        <p class="hero-subtitle">Descubre planes de alimentación personalizados, herramientas clínicas y suplementos diseñados científicamente para llevar tu bienestar al máximo nivel.</p>
        <div class="hero-actions">
          <Button variant="primary" @click="goPortal">Agendar Cita</Button>
          <Button variant="secondary" @click="goTienda">Visitar Tienda</Button>
        </div>
      </div>
      <div class="hero-image-wrapper">
        <div class="hero-placeholder-image">
          <!-- Placeholder para foto del nutriologo o plato saludable -->
          <span>📸 Imagen Hero (50%)</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from '../ui/Button.vue'

const router = useRouter()

const goPortal = () => router.push('/portal')
const goTienda = () => router.push('/tienda')
</script>

<style scoped>
.hero-section {
  padding: 4rem 2rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--border-color);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
}

.hero-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-placeholder-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-weight: 500;
  border: 2px dashed var(--border-color);
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
