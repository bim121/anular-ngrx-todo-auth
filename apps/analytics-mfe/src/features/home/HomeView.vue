<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">analytics-mfe</p>
      <h1>Analytics MFE</h1>
      <p>Vue 3 + Pinia stub — dashboard charts in Phase 5–6.</p>
      <nav class="links">
        <RouterLink to="/login">Sign in</RouterLink>
        <RouterLink to="/analytics">Analytics (auth)</RouterLink>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: #0f172a;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.card {
  width: min(100%, 28rem);
  padding: 2rem;
  border-radius: 1rem;
  background: #1e293b;
  border: 1px solid #334155;
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a78bfa;
}

h1 {
  margin: 0 0 0.5rem;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

a {
  color: #c4b5fd;
  font-weight: 600;
}
</style>
