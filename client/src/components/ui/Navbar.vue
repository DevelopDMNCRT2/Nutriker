<template>
  <header class="ui-navbar">
    <div class="ui-navbar-container">
      <div class="ui-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-text">NutriKer</span>
        </router-link>
      </div>
      <nav class="ui-nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/nosotros">Acerca de</router-link>
        <router-link to="/tienda">Tienda</router-link>
        <router-link to="/blog">Blog</router-link>
        <router-link to="/agendar">Agendar</router-link>
      </nav>
      <div class="ui-nav-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<style scoped>
.ui-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.ui-navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ui-brand .brand-link {
  text-decoration: none;
}

.ui-brand .brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.ui-nav-links {
  display: flex;
  gap: 2rem;
}

.ui-nav-links a {
  color: var(--text-main);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.ui-nav-links a:hover,
.ui-nav-links a.router-link-active {
  color: var(--color-primary);
}
</style>
