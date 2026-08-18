<template>
  <section class="slide-snap slide-partners bg-white dark:bg-gray-950">
    <div class="container text-center">
      <h2 class="section-title">Con Quién <span class="highlight">Trabaja</span></h2>
      <p class="subtitle mb-12">Alianzas, Hospitales e Instituciones</p>
      
      <div class="logos-grid">
        <div class="logo-item" v-for="i in 8" :key="i">
          <div class="logo-placeholder">Logo Institución {{ i }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-snap {
  scroll-snap-align: start;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6vw, 4.5rem);
  color: var(--color-secondary);
  line-height: 1.1;
  margin-bottom: 1rem;
}

.highlight {
  color: var(--color-primary);
  font-style: italic;
}

.subtitle {
  font-family: var(--font-main);
  font-size: 1.1rem;
  color: var(--color-text-light);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4rem;
}

.logos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  align-items: center;
}

.logo-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: var(--color-bg);
  border-radius: 12px;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.3s;
}

.logo-item:hover {
  filter: grayscale(0%);
  opacity: 1;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.logo-placeholder {
  font-weight: 700;
  color: #999;
  font-size: 1.2rem;
}

@media (max-width: 900px) {
  .logos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}
</style>
