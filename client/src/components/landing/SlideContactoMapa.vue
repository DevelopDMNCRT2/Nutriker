<template>
  <section class="slide-snap slide-contacto">
    <!-- Google Maps Background Iframe (Dark/Grayscale Mode possible with CSS filter) -->
    <div class="map-bg">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120422.39659357599!2d-99.255953!3d19.412196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce0026ceebcb43%3A0x884a199b0394c8d1!2sCiudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx" 
        width="100%" 
        height="100%" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
      <div class="map-overlay"></div>
    </div>

    <div class="container relative z-10 glass-container">
      <div class="text-center mb-10">
        <h2 class="section-title text-white">Dónde <span class="highlight">Encontrarnos</span></h2>
      </div>

      <div class="clinicas-grid">
        <!-- Clínica 1 -->
        <div class="clinica-card glassmorphism">
          <h3>Clínica Polanco</h3>
          <p class="address">Av. Presidente Masaryk 123, Polanco, CDMX</p>
          <div class="contact-info">
            <p>📞 +52 55 1234 5678</p>
            <p>✉️ polanco@nutriker.com</p>
          </div>
          <button class="btn-whatsapp">Agenda por WhatsApp</button>
        </div>

        <!-- Clínica 2 -->
        <div class="clinica-card glassmorphism">
          <h3>Clínica Roma</h3>
          <p class="address">Álvaro Obregón 45, Roma Norte, CDMX</p>
          <div class="contact-info">
            <p>📞 +52 55 8765 4321</p>
            <p>✉️ roma@nutriker.com</p>
          </div>
          <button class="btn-whatsapp">Agenda por WhatsApp</button>
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.map-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-bg iframe {
  width: 100%;
  height: 100%;
  filter: grayscale(80%) sepia(20%) hue-rotate(80deg) contrast(1.2); /* Estilo de mapa verde corporativo */
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 41, 59, 0.6); /* Oscurecer mapa */
  z-index: 2;
}

.glass-container {
  z-index: 10;
  width: 90%;
  max-width: 1000px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6vw, 4.5rem);
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.text-white {
  color: white;
}

.highlight {
  color: var(--color-primary-light);
  font-style: italic;
}

.clinicas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem;
  border-radius: 16px;
  color: white;
}

.clinica-card h3 {
  font-size: 1.8rem;
  font-family: var(--font-serif);
  margin-bottom: 1rem;
  color: white;
}

.address {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.contact-info {
  margin-bottom: 2rem;
  font-size: 1rem;
  opacity: 0.8;
}

.btn-whatsapp {
  background-color: #25D366; /* WhatsApp brand color */
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: transform 0.3s;
}

.btn-whatsapp:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
}

@media (max-width: 900px) {
  .clinicas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
