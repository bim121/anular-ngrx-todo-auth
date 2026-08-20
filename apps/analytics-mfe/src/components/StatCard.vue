<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
}>();
</script>

<template>
  <article class="stat-card">
    <h3>{{ title }}</h3>
    <p class="stat-value">{{ value }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-top: 3px solid var(--color-primary, #3b82f6);
  color: var(--color-text, #1f2937);
}

h3 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-muted, #6b7280);
}

.stat-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
}
</style>
