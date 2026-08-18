<template>
  <section class="slide-snap slide-hero">
    <div class="hero-content slide-in-bottom">
      <span class="editorial-badge">
        <span class="badge-dot"></span>
        Dra. Karla
      </span>
      <h1>Vitalidad<br/>Pura.</h1>
      <p class="subtitle">Medicina y Nutrición Integral para una vida plena.</p>
    </div>
    <div class="hero-image parallax-img fade-in">
      <img src="https://images.unsplash.com/photo-1594824432258-2da8b7bdcd84?q=80&w=2000&auto=format&fit=crop" alt="Dra Karla" />
    </div>
  </section>
</template>

<style scoped>
.slide-snap {
  scroll-snap-align: start;
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
  background-color: var(--color-bg);
}

.slide-hero {
  padding: 12rem 5vw 5rem;
  align-items: center;
}

.hero-content {
  position: relative;
  z-index: 5;
  width: 45%;
}

.hero-content h1 {
  font-size: clamp(4rem, 10vw, 8rem);
  line-height: 0.9;
  letter-spacing: -3px;
  color: var(--color-secondary);
  font-family: var(--font-serif);
  margin: 1.5rem 0;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text-light);
  max-width: 400px;
}

.hero-image {
  position: absolute;
  right: 5vw;
  top: 10vh;
  width: 45vw;
  height: 85vh;
  z-index: 2;
  border-radius: 12px;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 2s ease;
}

.hero-image:hover img {
  transform: scale(1.03);
}

.editorial-badge {
  display: inline-flex;
  align-items: center;
  color: var(--color-primary);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 2px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
  margin-right: 10px;
}

@media (max-width: 900px) {
  .slide-hero {
    flex-direction: column;
    padding-top: 8rem;
    justify-content: flex-start;
  }
  .hero-content {
    width: 100%;
    text-align: center;
  }
  .hero-image {
    position: relative;
    top: 2rem;
    right: 0;
    width: 90vw;
    height: 50vh;
  }
}
</style>
