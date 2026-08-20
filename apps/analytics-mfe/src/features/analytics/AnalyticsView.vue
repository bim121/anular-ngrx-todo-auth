<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useTodos } from '@/composables/useTodos';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import StatCard from '@/components/StatCard.vue';
import ChartPanel from '@/components/ChartPanel.vue';
import StatsChart from './StatsChart.vue';

const router = useRouter();
const { userName, logout } = useAuth();
const { todos, load } = useTodos();
const ready = ref(false);
const theme = ref<'light' | 'dark'>('light');

onMounted(async () => {
  const stored = document.documentElement.getAttribute('data-theme');
  theme.value = stored === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  await load();
  ready.value = true;
});

const total = computed(() => todos.value.length);
const completed = computed(() => todos.value.filter((t) => t.completed).length);
const active = computed(() => total.value - completed.value);

function handleLogout(): void {
  logout();
  router.push('/login');
}

function toggleTheme(): void {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
}
</script>

<template>
  <DashboardLayout
    :user-name="userName"
    :theme-label="theme === 'dark' ? 'Dark' : 'Light'"
    @logout="handleLogout"
    @toggle-theme="toggleTheme"
  >
    <header class="page-head">
      <h1>Analytics dashboard</h1>
      <p class="hint">Phase 6 — sidebar layout + Chart.js panel (tokens via data-theme).</p>
    </header>

    <div class="stats-row">
      <StatCard title="Total todos" :value="ready ? total : '…'" />
      <StatCard title="Active" :value="ready ? active : '…'" />
      <StatCard title="Completed" :value="ready ? completed : '…'" />
    </div>

    <ChartPanel title="Completed by tag" aria-label="Completed todos by tag chart">
      <StatsChart />
    </ChartPanel>

    <div class="grid-2">
      <ChartPanel title="Focus" aria-label="Todo summary">
        <p class="summary">
          {{ ready ? `${active} open · ${completed} done` : 'Loading…' }}
        </p>
      </ChartPanel>
      <ChartPanel title="Tips" aria-label="Dashboard tips">
        <p class="summary">
          Kanban over-fetching on Angular will move to GraphQL in Phase 13; this
          dashboard already filters client-side from the same REST list.
        </p>
      </ChartPanel>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-head {
  margin-bottom: 1.25rem;
}

h1 {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
}

.hint {
  margin: 0;
  color: var(--color-muted, #6b7280);
  font-size: 0.9rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary {
  margin: 0;
  color: var(--color-muted, #6b7280);
  font-size: 0.9rem;
  line-height: 1.45;
}

@media (max-width: 720px) {
  .stats-row,
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
