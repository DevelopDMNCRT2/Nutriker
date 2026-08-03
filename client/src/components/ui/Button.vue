<template>
  <button 
    :class="['ui-btn', `ui-btn-${variant}`, { 'ui-btn-block': block }]" 
    :type="type" 
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false }
});
defineEmits(['click']);
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-base);
  font-weight: 500;
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.ui-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.ui-btn:active {
  transform: translateY(0);
}

.ui-btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
.ui-btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.ui-btn-secondary {
  background-color: var(--color-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}
.ui-btn-secondary:hover {
  background-color: var(--color-bg);
}

.ui-btn-danger {
  background-color: var(--color-accent);
  color: var(--text-inverse);
}
.ui-btn-danger:hover {
  background-color: var(--color-accent-hover);
}

.ui-btn-block {
  width: 100%;
}
</style>
