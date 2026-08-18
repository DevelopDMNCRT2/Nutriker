<template>
  <section class="slide-snap slide-acerca bg-gray-50 dark:bg-gray-900">
    <div class="container grid-2">
      <div class="image-box">
        <!-- Generar imagen de una doctora elegante en consultorio -->
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2000&auto=format&fit=crop" alt="Dra. Karla en el consultorio" />
        <div class="accent-box"></div>
      </div>
      <div class="content-box">
        <h2 class="section-title">Quién es <span class="highlight">Ella</span></h2>
        <h3 class="subtitle">Dra. Karla – Nutrición Clínica y Metabolismo</h3>
        <p class="paragraph">
          Con más de 10 años de experiencia transformando la relación de las personas con sus hábitos alimenticios, la Dra. Karla fundó NutriKer con una premisa simple: la salud no se mide solo en la balanza, sino en la calidad de vida.
        </p>
        <p class="paragraph">
          Especialista en nutrición clínica y metabolismo, ha dedicado su carrera a crear planes sostenibles, alejados de las dietas restrictivas y enfocados en el bienestar integral.
        </p>
        <button class="btn-outline mt-6">Conocer su currículum</button>
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

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.image-box {
  position: relative;
  height: 70vh;
  border-radius: 8px;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  position: relative;
  z-index: 2;
}

.accent-box {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 50%;
  height: 50%;
  background-color: var(--color-primary-light);
  border-radius: 12px;
  z-index: 1;
  opacity: 0.3;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.paragraph {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: var(--color-primary);
  color: white;
}

@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .image-box {
    height: 40vh;
  }
}
</style>
