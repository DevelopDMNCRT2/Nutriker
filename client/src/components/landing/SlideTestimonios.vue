<template>
  <section class="slide-snap slide-testimonios bg-gray-50 dark:bg-gray-900">
    <div class="container">
      <div class="text-center mb-16">
        <h2 class="section-title">Casos de <span class="highlight">Éxito</span></h2>
        <p class="subtitle">Lo que dicen nuestros pacientes</p>
      </div>

      <div class="cards-grid">
        <div class="testimonio-card" v-for="i in 3" :key="i">
          <div class="quote-icon">“</div>
          <p class="testimonio-text">La Dra. Karla cambió completamente mi perspectiva sobre la alimentación. Su plan no fue una dieta, fue un cambio de vida sostenible y lleno de energía.</p>
          <div class="testimonio-author">
            <div class="author-avatar"></div>
            <div>
              <h4>Paciente Frecuente</h4>
              <span>-15kg y metabolismo recuperado</span>
            </div>
          </div>
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

.mb-16 {
  margin-bottom: 4rem;
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
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.testimonio-card {
  background: var(--color-bg);
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  position: relative;
  transition: transform 0.3s;
}

.testimonio-card:hover {
  transform: translateY(-5px);
}

.quote-icon {
  font-family: var(--font-serif);
  font-size: 6rem;
  color: var(--color-primary-light);
  opacity: 0.3;
  position: absolute;
  top: 10px;
  left: 20px;
  line-height: 1;
}

.testimonio-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-text-light);
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.testimonio-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background-color: var(--color-primary-light);
  border-radius: 50%;
}

.testimonio-author h4 {
  font-weight: 700;
  color: var(--color-primary-dark);
  margin: 0;
}

.testimonio-author span {
  font-size: 0.85rem;
  color: #777;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
