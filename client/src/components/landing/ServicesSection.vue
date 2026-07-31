<template>
  <section class="services-section">
    <div class="services-container">
      <div class="section-header">
        <h2>Servicios Profesionales</h2>
        <p>Soluciones integrales para tu salud</p>
      </div>
      
      <div class="services-grid">
        <Card class="service-card">
          <div class="icon-wrapper">🩺</div>
          <h3>Nutrición Clínica</h3>
          <p>Tratamiento dietético para condiciones específicas, enfermedades metabólicas y optimización de salud general con seguimiento preciso.</p>
        </Card>
        
        <Card class="service-card">
          <div class="icon-wrapper">🏃</div>
          <h3>Nutrición Deportiva</h3>
          <p>Planes enfocados en atletas y personas activas para mejorar el rendimiento, recuperación muscular y composición corporal.</p>
        </Card>
        
        <Card class="service-card">
          <div class="icon-wrapper">🛒</div>
          <h3>Suplementación y Tienda</h3>
          <p>Acceso a productos validados científicamente para complementar tus requerimientos y potenciar tus resultados.</p>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup>
import Card from '../ui/Card.vue'
</script>

<style scoped>
.services-section {
  padding: 6rem 2rem;
  background-color: var(--color-bg);
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--text-muted);
  font-size: 1.125rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
}

.icon-wrapper {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.service-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-main);
}

.service-card p {
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
