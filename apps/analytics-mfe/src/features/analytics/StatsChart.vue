<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'vue-chartjs';
import { useTodos } from '@/composables/useTodos';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { todos, load } = useTodos();
const loading = ref(true);

onMounted(async () => {
  await load();
  loading.value = false;
});

const chartData = computed(() => {
  const byTag = new Map<string, number>();
  for (const todo of todos.value) {
    if (!todo.completed) continue;
    const tags = todo.tags?.length ? todo.tags : ['untagged'];
    for (const tag of tags) {
      byTag.set(tag, (byTag.get(tag) ?? 0) + 1);
    }
  }
  const labels = [...byTag.keys()].sort();
  return {
    labels,
    datasets: [
      {
        label: 'Completed by tag',
        backgroundColor: '#8b5cf6',
        data: labels.map((label) => byTag.get(label) ?? 0),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Completed todos by tag (Chart.js spike)' },
  },
};
</script>

<template>
  <section class="chart-card">
    <div class="chart-wrap" :aria-busy="loading">
      <p v-if="loading" class="hint">Loading chart…</p>
      <Bar v-else :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #0b1220;
  border: 1px solid #334155;
}

/* Fixed height reserves space while loading — avoids CLS (V.5.2). */
.chart-wrap {
  height: 240px;
  position: relative;
}

.hint {
  color: #94a3b8;
  margin: 0;
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
