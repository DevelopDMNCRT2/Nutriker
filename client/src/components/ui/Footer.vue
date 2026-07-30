<template>
  <footer class="ui-footer">
    <div class="ui-footer-container">
      <div class="footer-info">
        <h3>NutriKer</h3>
        <p>Nutrición Clínica y Salud Integral</p>
      </div>
      <div class="footer-links">
        <a href="#">Términos y Condiciones</a>
        <a href="#">Aviso de Privacidad</a>
      </div>
    </div>
    <div class="footer-copy">
      &copy; {{ new Date().getFullYear() }} NutriKer. Todos los derechos reservados.
    </div>
  </footer>
</template>

<style scoped>
.ui-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--border-color);
  padding: 3rem 2rem 1rem;
  margin-top: 4rem;
}

.ui-footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-info h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.footer-info p {
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-muted);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-copy {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
