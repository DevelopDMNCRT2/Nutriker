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
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 70px - 200px);
  padding: 2rem;
}
</style>
