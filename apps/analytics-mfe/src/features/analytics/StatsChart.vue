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
        backgroundColor: '#3b82f6',
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
    title: { display: false },
  },
};
</script>

<template>
  <div class="chart-wrap" :aria-busy="loading" aria-label="Bar chart of completed todos by tag">
    <p v-if="loading" class="hint">Loading chart…</p>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap {
  height: 240px;
  position: relative;
}

.hint {
  color: var(--color-muted, #6b7280);
  margin: 0;
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
