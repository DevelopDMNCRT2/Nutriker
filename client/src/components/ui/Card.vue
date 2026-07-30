<template>
  <div class="ui-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.ui-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: box-shadow var(--transition-base);
}

.ui-card:hover {
  box-shadow: var(--shadow-md);
}
</style>
