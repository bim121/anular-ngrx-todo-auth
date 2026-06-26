<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useLogout } from '@/composables/useLogout';
import { useTodoFilter } from '@/composables/useTodoFilter';
import {
  useAddTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useTodosQuery,
} from '@/features/todos/useTodosQuery';

const router = useRouter();
const { userName } = useAuth();
const logout = useLogout();

const { data, isLoading, error: queryError } = useTodosQuery();
const addTodoMutation = useAddTodoMutation();
const deleteTodoMutation = useDeleteTodoMutation();
const toggleTodoMutation = useToggleTodoMutation();

const todos = computed(() => data.value ?? []);
const { filter, filteredTodos } = useTodoFilter(todos);

const newTask = ref('');
const actionError = ref<string | null>(null);

const mutating = computed(
  () =>
    addTodoMutation.isPending.value ||
    deleteTodoMutation.isPending.value ||
    toggleTodoMutation.isPending.value
);

const error = computed(
  () =>
    actionError.value ??
    (queryError.value instanceof Error ? queryError.value.message : null)
);

watch(filter, (value) => {
  if (import.meta.env.DEV) {
    console.info('[analytics-mfe] todo filter changed:', value);
  }
});

async function handleAdd(): Promise<void> {
  const task = newTask.value.trim();
  if (!task || mutating.value) {
    return;
  }

  actionError.value = null;

  try {
    await addTodoMutation.mutateAsync(task);
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

  const todo = todos.value.find((item) => item.id === todoId);
  if (!todo) {
    return;
  }

  actionError.value = null;

  try {
    await toggleTodoMutation.mutateAsync(todo);
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
    await deleteTodoMutation.mutateAsync(todoId);
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
          :disabled="isLoading || mutating"
        />
        <button type="submit" :disabled="!newTask.trim() || isLoading || mutating">
          Add Task
        </button>
      </form>

      <p v-if="isLoading" class="status" aria-busy="true">Loading tasks…</p>

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

        <ul class="list">
          <li
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="item"
            :class="{ 'item--done': todo.completed }"
          >
            <label class="item__label">
              <input
                type="checkbox"
                :checked="todo.completed"
                :disabled="mutating"
                @change="handleToggle(todo.id)"
              />
              <span>{{ todo.task }}</span>
            </label>
            <button
              type="button"
              class="item__delete"
              :disabled="mutating"
              @click="handleDelete(todo.id)"
            >
              Delete
            </button>
          </li>
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
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

.item__label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
}

.item--done span {
  text-decoration: line-through;
  color: #94a3b8;
}

.item__delete {
  padding: 0.35rem 0.65rem;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  background: transparent;
  color: #fca5a5;
  cursor: pointer;
}

.item__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
