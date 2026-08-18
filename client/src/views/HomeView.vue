<template>
  <div class="brochure-container">
    <SlideHero id="inicio" />
    <SlideAcercaDe id="acerca" />
    <SlideLogros id="logros" />
    <SlidePartners id="partners" />
    <SlideTestimonios id="testimonios" />
    <SlideGaleria id="galeria" />
    <SlideContactoMapa id="contacto" />
    
    <!-- Floating Agendar Button -->
    <button class="floating-agendar" @click="appStore.toggleModal(true)">
      Agendar Cita
    </button>
  </div>
</template>

<script setup>
import SlideHero from '../components/landing/SlideHero.vue'
import SlideAcercaDe from '../components/landing/SlideAcercaDe.vue'
import SlideLogros from '../components/landing/SlideLogros.vue'
import SlidePartners from '../components/landing/SlidePartners.vue'
import SlideTestimonios from '../components/landing/SlideTestimonios.vue'
import SlideGaleria from '../components/landing/SlideGaleria.vue'
import SlideContactoMapa from '../components/landing/SlideContactoMapa.vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.brochure-container {
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  /* Ocultar barra de scroll para mayor estética en Webkit */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

.brochure-container::-webkit-scrollbar {
  display: none;
}

/* ── FLOATING BUTTON ── */
.floating-agendar {
  position: fixed;
  top: 30px; 
  right: 40px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  padding: 1rem 2rem;
  font-family: var(--font-main);
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(74, 140, 91, 0.5);
  z-index: 9999;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s;
}

.floating-agendar:hover {
  transform: translateY(-8px) scale(1.02);
  background-color: var(--color-primary-dark);
}

@media (max-width: 900px) {
  .floating-agendar {
    top: auto;
    bottom: 20px;
    right: 50%;
    transform: translateX(50%);
    width: 90%;
    text-align: center;
    z-index: 8000;
  }
}
</style>
