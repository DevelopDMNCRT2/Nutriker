<template>
  <Navbar />
  <main class="main-content">
    <router-view />
  </main>
  <Footer />
</template>

<script setup>
import Navbar from './components/ui/Navbar.vue'
import Footer from './components/ui/Footer.vue'
<<<<<<< HEAD
import Button from './components/ui/Button.vue'
import Card from './components/ui/Card.vue'
=======
>>>>>>> main
</script>

<style scoped>
.main-content {
<<<<<<< HEAD
  min-height: calc(100vh - 70px - 200px); /* Restando navbar y footer aprox */
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: var(--color-primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.125rem;
  margin-bottom: 3rem;
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
=======
  min-height: calc(100vh - 70px - 200px); /* Ajuste dinámico entre navbar y footer */
>>>>>>> main
}
</style>
