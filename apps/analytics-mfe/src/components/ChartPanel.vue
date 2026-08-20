<script setup lang="ts">
defineProps<{
  title: string;
  ariaLabel?: string;
}>();
</script>

<template>
  <section class="chart-panel" :aria-label="ariaLabel ?? title">
    <header class="chart-panel__head">
      <h2>{{ title }}</h2>
    </header>
    <div class="chart-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.chart-panel {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  color: var(--color-text, #1f2937);
}

.chart-panel__head h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.chart-panel__body {
  min-height: 0;
}
</style>
