<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import StatsChart from './StatsChart.vue';

const router = useRouter();
const { userName, logout } = useAuth();

function handleLogout(): void {
  logout();
  router.push('/login');
}
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">analytics-mfe</p>
      <h1>Analytics dashboard</h1>
      <p v-if="userName">Welcome, {{ userName }}!</p>
      <p class="hint">Phase 5 — Chart.js spike (completed by tag).</p>
      <StatsChart />
      <nav class="links">
        <RouterLink to="/todos">My Todos</RouterLink>
      </nav>
      <button type="button" @click="handleLogout">Logout</button>
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
  width: min(100%, 40rem);
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

.hint {
  color: #94a3b8;
}

.links {
  margin-top: 1rem;
}

.links a {
  color: #c4b5fd;
  font-weight: 600;
  text-decoration: none;
}

button {
  margin-top: 1.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #475569;
  color: white;
  cursor: pointer;
}
</style>
