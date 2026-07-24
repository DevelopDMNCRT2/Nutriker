<template>
  <div class="footer-wrapper">
    <!-- Wave top divider -->
    <div class="footer-wave">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C89.71,114.62,204.47,78.25,321.39,56.44Z" class="shape-fill"></path>
      </svg>
    </div>

    <footer class="footer">
      <div class="container">
        
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand fade-in-up">
            <span class="footer-brand-text">NutriKer</span>
            <p class="brand-desc mt-4">Clínica Nutricional y del Metabolismo centrada en tu bienestar integral con enfoques científicos y personalizados.</p>
            
            <div class="social-links mt-4">
              <a href="#" aria-label="Facebook" class="social-icon"><Facebook :size="20" /></a>
              <a href="#" aria-label="Twitter" class="social-icon"><Twitter :size="20" /></a>
              <a href="#" aria-label="Instagram" class="social-icon"><Instagram :size="20" /></a>
              <a href="#" aria-label="LinkedIn" class="social-icon"><Linkedin :size="20" /></a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div class="footer-links fade-in-up" style="animation-delay: 0.1s;">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="#inicio" class="hover-slide">Inicio</a></li>
              <li><a href="#nosotros" class="hover-slide">Nosotros</a></li>
              <li><a href="#servicios" class="hover-slide">Servicios</a></li>
              <li><router-link to="/portal" class="hover-slide">Portal del Paciente</router-link></li>
              <li><a href="#contacto" class="hover-slide">Contacto</a></li>
            </ul>
          </div>

          <!-- Contact Column -->
          <div class="footer-contact fade-in-up" style="animation-delay: 0.2s;">
            <h3>Contacto</h3>
            <ul class="contact-list">
              <li>
                <MapPin :size="18" class="contact-icon" />
                <span>Av. Principal #123, Ciudad</span>
              </li>
              <li>
                <Phone :size="18" class="contact-icon" />
                <span>+52 (55) 1234 5678</span>
              </li>
              <li>
                <Mail :size="18" class="contact-icon" />
                <span>hola@nutriker.com</span>
              </li>
            </ul>
            <div class="mt-4">
               <button class="btn btn-outline-light btn-sm w-full text-center" @click="appStore.toggleModal(true)">Agendar Cita</button>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} NutriKer. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const appStore = useAppStore()
</script>

<style scoped>
.footer-wrapper {
  margin-top: 6rem;
  position: relative;
}

.footer-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: translateY(-99%);
}

.footer-wave svg {
  position: relative;
  display: block;
  width: calc(150% + 1.3px);
  height: 80px;
}

.footer-wave .shape-fill {
  fill: var(--color-secondary);
}

.footer {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #0a2628 100%);
  color: var(--color-white);
  padding: 3rem 0 1.5rem 0;
  position: relative;
}

/* Grid Layout */
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand-text {
  font-family: var(--font-main);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: -0.02em;
  display: inline-block;
}

.brand-desc {
  color: rgba(255,255,255,0.7);
  max-width: 300px;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-icon:hover {
  background: var(--color-primary);
  color: var(--color-secondary);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 15px rgba(117, 203, 190, 0.3);
}

/* Headings */
h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-primary-light);
  position: relative;
  display: inline-block;
}

h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  width: 30px;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.footer-links:hover h3::after,
.footer-contact:hover h3::after {
  width: 50px;
}

/* Links */
.footer-links ul {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hover-slide {
  color: rgba(255,255,255,0.8);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  position: relative;
}

.hover-slide::before {
  content: '→';
  position: absolute;
  left: -20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: var(--color-primary);
}

.hover-slide:hover {
  color: var(--color-white);
  transform: translateX(15px);
}

.hover-slide:hover::before {
  opacity: 1;
  transform: translateX(0);
}

/* Contact List */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: rgba(255,255,255,0.8);
  transition: color 0.3s ease;
}

.contact-list li:hover {
  color: var(--color-white);
}

.contact-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 0.15rem;
}

/* Buttons */
.btn-outline-light {
  background: transparent;
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  display: inline-block;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-white);
  transform: translateY(-2px);
}

.btn-sm {
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
}
.w-full {
  width: 100%;
}
.text-center {
  text-align: center;
}

/* Footer Bottom */
.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
  }
  
  .footer-wave svg {
    height: 120px;
  }
}
</style>
