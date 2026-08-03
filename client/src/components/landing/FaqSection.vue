<template>
  <section class="faq-section">
    <div class="container">
      <div class="section-header">
        <h2>Preguntas Frecuentes</h2>
        <p>Resuelve tus dudas antes de agendar</p>
      </div>
      
      <div class="faq-list">
        <Card class="faq-item" v-for="(faq, idx) in faqs" :key="idx">
          <h3>{{ faq.q }}</h3>
          <p>{{ faq.a }}</p>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup>
import Card from '../ui/Card.vue'

const faqs = [
  {
    q: "¿Cómo funciona la primera consulta?",
    a: "Realizamos una evaluación clínica completa, analizamos tus objetivos, historial médico, y composición corporal para diseñar un plan 100% personalizado."
  },
  {
    q: "¿Cada cuánto son las revisiones?",
    a: "Depende de tus objetivos, pero normalmente recomendamos un seguimiento cada 3 a 4 semanas para ajustar el plan y evaluar progreso."
  },
  {
    q: "¿Puedo comprar suplementos sin ser paciente?",
    a: "¡Sí! Nuestra tienda está abierta al público y ofrecemos envíos a todo el país. Sin embargo, si eres paciente tienes descuentos especiales."
  }
]
</script>

<style scoped>
.faq-section {
  padding: 6rem 2rem;
  background-color: var(--color-bg);
}

.container {
  max-width: 800px; /* Más angosto para lectura cómoda */
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

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item h3 {
  font-size: 1.125rem;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.faq-item p {
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
