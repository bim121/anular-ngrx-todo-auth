<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useLogout } from '@/composables/useLogout';
import { useTodoFilter } from '@/composables/useTodoFilter';
import { useTodos } from '@/composables/useTodos';
import TodoRow from './TodoRow.vue';

const router = useRouter();
const { userName } = useAuth();
const logout = useLogout();

const { todos, loading, error: storeError, mutating, load, add, toggle, remove } =
  useTodos();

const { filter, filteredTodos } = useTodoFilter(todos);

const newTask = ref('');
const actionError = ref<string | null>(null);

const error = computed(
  () => actionError.value ?? storeError.value
);

watch(filter, (value) => {
  if (import.meta.env.DEV) {
    console.info('[analytics-mfe] todo filter changed:', value);
  }
});

onMounted(() => {
  void load().catch(() => {
    /* error already in store */
  });
});

async function handleAdd(): Promise<void> {
  const task = newTask.value.trim();
  if (!task || mutating.value) {
    return;
  }

  actionError.value = null;

  try {
    await add(task);
    newTask.value = '';
  } catch (err) {
    actionError.value =
      err instanceof Error ? err.message : 'Failed to add todo';
  }
}

async function handleToggle(todoId: string): Promise<void> {
  if (mutating.value) {
    return;
  }

  actionError.value = null;

  try {
    await toggle(todoId);
  } catch (err) {
    actionError.value =
      err instanceof Error ? err.message : 'Failed to update todo';
  }
}

async function handleDelete(todoId: string): Promise<void> {
  if (mutating.value) {
    return;
  }

  if (!globalThis.confirm('Are you sure you want to delete this task?')) {
    return;
  }

  actionError.value = null;

  try {
    await remove(todoId);
  } catch (err) {
    actionError.value =
      err instanceof Error ? err.message : 'Failed to delete todo';
  }
}

function handleLogout(): void {
  logout();
  router.push('/login');
}
</script>

<template>
  <main class="page">
    <header class="header">
      <div>
        <p class="eyebrow">analytics-mfe</p>
        <h1>My Todos</h1>
        <p v-if="userName" class="user">Signed in as {{ userName }}</p>
      </div>
      <button type="button" class="logout" @click="handleLogout">
        Logout
      </button>
    </header>

    <section class="card">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <form class="form" @submit.prevent="handleAdd">
        <input
          v-model="newTask"
          type="text"
          placeholder="What needs to be done?"
          aria-label="New task"
          :disabled="loading || mutating"
        />
        <button type="submit" :disabled="!newTask.trim() || loading || mutating">
          Add Task
        </button>
      </form>

      <p v-if="loading" class="status" aria-busy="true">Loading tasks…</p>

      <template v-else>
        <div class="filters" role="group" aria-label="Filter tasks">
          <button
            v-for="value in ['all', 'active', 'done'] as const"
            :key="value"
            type="button"
            class="filter"
            :class="{ 'filter--active': filter === value }"
            @click="filter = value"
          >
            {{ value.charAt(0).toUpperCase() + value.slice(1) }}
          </button>
        </div>

        <p class="count">{{ filteredTodos.length }} items</p>
        <p class="hint">
          Tip: task starting with <code>[500]</code> rolls back on toggle (mock API error).
        </p>

        <ul class="list" role="list">
          <TodoRow
            v-for="todo in filteredTodos"
            :key="todo.id"
            v-memo="[todo.id, todo.completed, todo.task, mutating]"
            :todo="todo"
            :disabled="mutating"
            @toggle="handleToggle"
            @delete="handleDelete"
          />
          <li v-if="filteredTodos.length === 0" class="empty">No todos</li>
        </ul>
      </template>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 1.5rem;
  background: linear-gradient(160deg, #1e1b4b, #312e81 55%, #4c1d95);
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a78bfa;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user {
  margin: 0.35rem 0 0;
  color: #c4b5fd;
  font-size: 0.9rem;
}

.logout {
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 0.5rem;
  background: #dc2626;
  color: #fff;
  cursor: pointer;
}

.card {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form input {
  flex: 1;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #475569;
  background: #0f172a;
  color: inherit;
}

.form button {
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #7c3aed;
  color: #fff;
  cursor: pointer;
}

.form button:disabled,
.form input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  margin: 0;
  color: #94a3b8;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.filter {
  padding: 0.4rem 0.75rem;
  border: 1px solid #475569;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.filter--active {
  background: #7c3aed;
  border-color: #7c3aed;
}

.count {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.hint {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.hint code {
  color: #c4b5fd;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: min(60vh, 520px);
  overflow: auto;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.5rem;
  padding-inline: 0.75rem;
}

.empty {
  padding: 1rem 0;
  color: #94a3b8;
  text-align: center;
}

.error {
  margin: 0 0 1rem;
  color: #fca5a5;
}
</style>
