<template>
  <Navbar v-if="showNavigation" />
  <main :class="['main-content', { 'has-nav': showNavigation }]">
    <router-view />
  </main>
  <Footer v-if="showNavigation" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/ui/Navbar.vue'
import Footer from './components/ui/Footer.vue'

const route = useRoute()

// Ocultar Navbar y Footer en las rutas del portal de pacientes y presentaciones externas
const showNavigation = computed(() => {
  const hiddenRoutes = ['/miperfil', '/crear-password', '/portal', '/royal-canin']
  return !hiddenRoutes.includes(route.path)
})
</script>

<style scoped>
.main-content {
  min-height: 100vh;
}
.main-content.has-nav {
  min-height: calc(100vh - 70px - 200px);
  padding: 2rem;
}
</style>
