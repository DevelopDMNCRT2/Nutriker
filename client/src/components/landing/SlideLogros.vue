<template>
  <section class="slide-snap slide-logros">
    <div class="container">
      <div class="text-center mb-16">
        <h2 class="section-title">Qué ha <span class="highlight">Logrado</span></h2>
        <p class="subtitle">Números que respaldan nuestra metodología</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">+5,000</div>
          <div class="stat-label">Pacientes Atendidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">10+</div>
          <div class="stat-label">Años de Experiencia</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">4</div>
          <div class="stat-label">Certificaciones Internacionales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">98%</div>
          <div class="stat-label">Tasa de Éxito y Retención</div>
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
  background-color: var(--color-primary-dark);
  color: white;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

.mb-16 {
  margin-bottom: 4rem;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6vw, 4.5rem);
  line-height: 1.1;
  margin-bottom: 1rem;
}

.highlight {
  color: var(--color-primary-light);
  font-style: italic;
}

.subtitle {
  font-family: var(--font-main);
  font-size: 1.25rem;
  opacity: 0.8;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s, background 0.3s;
}

.stat-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-primary-light);
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.stat-label {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stat-card {
    padding: 2rem;
  }
}
</style>
