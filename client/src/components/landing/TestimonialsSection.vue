<template>
  <section class="testimonials-section">
    <div class="container">
      <div class="section-header">
        <h2>Casos de Éxito</h2>
        <p>Pacientes reales que han transformado sus vidas.</p>
      </div>
      
      <div class="testimonials-grid">
        <Card class="testimonial-card" v-for="i in 3" :key="i">
          <div class="stars">⭐⭐⭐⭐⭐</div>
          <p class="quote">"El mejor acompañamiento nutricional que he tenido. No solo cambié mi cuerpo, sino mi relación con la comida. 100% recomendado."</p>
          <div class="author">
            <div class="author-avatar">👤</div>
            <div class="author-info">
              <h4>Paciente {{ i }}</h4>
              <span>Nutrición Deportiva</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup>
import Card from '../ui/Card.vue'
</script>

<style scoped>
.testimonials-section {
  padding: 6rem 2rem;
  background-color: var(--color-surface);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--text-muted);
  font-size: 1.125rem;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stars {
  margin-bottom: 1rem;
}

.quote {
  color: var(--text-main);
  font-style: italic;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  font-size: 2rem;
  background: var(--color-bg);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-info h4 {
  margin: 0;
  font-size: 1rem;
}

.author-info span {
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
