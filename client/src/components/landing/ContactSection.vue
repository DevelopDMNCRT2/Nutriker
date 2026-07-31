<template>
  <section class="contact-section">
    <div class="container">
      <div class="contact-content">
        <h2>¿Listo para empezar?</h2>
        <p>Visítanos en nuestra clínica o contáctanos para agendar tu consulta online.</p>
        
        <div class="contact-info">
          <div class="info-item">
            <strong>📍 Ubicación:</strong>
            <span>Av. Salud Integral 123, Ciudad Médica</span>
          </div>
          <div class="info-item">
            <strong>📧 Correo:</strong>
            <span>contacto@nutriker.com</span>
          </div>
          <div class="info-item">
            <strong>📱 Teléfono / WhatsApp:</strong>
            <span>+52 (55) 1234-5678</span>
          </div>
        </div>
        
        <Button variant="primary" block style="margin-top: 2rem;">Contáctanos por WhatsApp</Button>
      </div>
    </div>
  </section>
</template>

<script setup>
import Button from '../ui/Button.vue'
</script>

<style scoped>
.contact-section {
  padding: 6rem 2rem;
  background-color: var(--color-surface);
  border-top: 1px solid var(--border-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.contact-content {
  max-width: 600px;
  text-align: center;
}

.contact-content h2 {
  font-size: 2.5rem;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.contact-content p {
  color: var(--text-muted);
  font-size: 1.125rem;
  margin-bottom: 3rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  background-color: var(--color-bg);
  padding: 2rem;
  border-radius: var(--radius-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: var(--color-primary);
}

.info-item span {
  color: var(--text-main);
  font-size: 1.125rem;
}
</style>
