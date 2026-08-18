<template>
  <section class="slide-snap slide-galeria bg-white dark:bg-gray-950">
    <div class="container text-center">
      <h2 class="section-title">Espacios <span class="highlight">Sanadores</span></h2>
      <p class="subtitle mb-12">Nuestras Instalaciones</p>

      <div class="masonry-grid">
        <div class="masonry-item img-1">
          <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" alt="Clínica Recepción" />
        </div>
        <div class="masonry-item img-2">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" alt="Consultorio" />
        </div>
        <div class="masonry-item img-3">
          <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop" alt="Equipo de medición" />
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

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 250px);
  gap: 1.5rem;
}

.masonry-item {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.masonry-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.masonry-item:hover img {
  transform: scale(1.05);
}

.img-1 {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

.img-2 {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
}

.img-3 {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}

@media (max-width: 900px) {
  .masonry-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .img-1, .img-2, .img-3 {
    grid-column: 1 / -1;
    grid-row: auto;
    height: 30vh;
  }
}
</style>
