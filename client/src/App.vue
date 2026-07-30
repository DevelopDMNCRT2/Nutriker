<template>
  <Navbar />
  
  <main class="main-content">
    <div class="container">
      <h1 class="page-title">Sistema de Diseño Base</h1>
      <p class="page-subtitle">Demostración de los componentes principales para NutriKer.</p>
      
      <section class="demo-section">
        <h2>Tarjetas y Botones</h2>
        <div class="card-grid">
          <Card>
            <h3>Nutrición Clínica</h3>
            <p style="color: var(--text-muted); margin: 1rem 0;">
              Planes personalizados diseñados para alcanzar tus objetivos de salud y rendimiento.
            </p>
            <div style="display: flex; gap: 1rem;">
              <Button variant="primary">Agendar Cita</Button>
              <Button variant="secondary">Saber más</Button>
            </div>
          </Card>
          
          <Card>
            <h3>Alerta Importante</h3>
            <p style="color: var(--text-muted); margin: 1rem 0;">
              Este es un ejemplo de un componente con variante de peligro o alerta para el usuario.
            </p>
            <Button variant="danger" block>Eliminar Registro</Button>
          </Card>
        </div>
      </section>
    </div>
  </main>
  
  <Footer />
</template>

<script setup>
import Navbar from './components/ui/Navbar.vue'
import Footer from './components/ui/Footer.vue'
import Button from './components/ui/Button.vue'
import Card from './components/ui/Card.vue'
</script>

<style scoped>
.main-content {
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
}
</style>
