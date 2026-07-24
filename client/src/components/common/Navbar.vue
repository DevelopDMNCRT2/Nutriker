<template>
  <header class="editorial-header">
    <div class="header-left">
      <router-link to="/">
        <img src="/icon_apple.png" alt="NutriKer Ícono" class="navbar-icon" />
      </router-link>
    </div>
    
    <div class="header-center">
      <router-link to="/">
        <img src="/logo_text.png" alt="NutriKer" class="brand-image" />
      </router-link>
    </div>

    <div class="header-right">
      <router-link to="/portal" class="btn-portal">
        <svg class="portal-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span>Portal Paciente</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.editorial-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem 3rem;
  z-index: 50;
  
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  
  pointer-events: none;
}

.header-left, .header-center, .header-right {
  pointer-events: auto;
}

.header-left {
  display: flex;
  justify-content: flex-start;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.navbar-icon {
  height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  transition: transform 0.3s;
}

.navbar-icon:hover {
  transform: scale(1.1);
}

.brand-image {
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.8));
}

.btn-portal {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-family: var(--font-main);
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(74, 140, 91, 0.25);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-portal:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 140, 91, 0.35);
}

.portal-btn-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .editorial-header {
    padding: 1rem 1.5rem;
  }
  .navbar-icon {
    height: 38px;
  }
  .brand-image {
    height: 32px;
  }
  .btn-portal span {
    display: none;
  }
  .btn-portal {
    padding: 0.5rem;
    border-radius: 50%;
  }
}
</style>
