import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from '@/core/api';
import { applyFilter, type TodoFilter } from '@/features/todos/apply-filter';
import { useAuthStore } from './auth';

function normalize(todos: Todo[]): {
  entities: Record<string, Todo>;
  ids: string[];
} {
  const entities: Record<string, Todo> = {};
  const ids: string[] = [];

  for (const todo of todos) {
    entities[todo.id] = todo;
    ids.push(todo.id);
  }

  return { entities, ids };
}

export const useTodosStore = defineStore('todos', () => {
  const entities = ref<Record<string, Todo>>({});
  const ids = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const allTodos = computed(() =>
    ids.value.map((id) => entities.value[id]).filter(Boolean)
  );

  function filteredTodos(filter: TodoFilter): Todo[] {
    return applyFilter(allTodos.value, filter);
  }

  function requireAuth(): { userId: string; token: string } {
    const auth = useAuthStore();
    if (!auth.userId || !auth.token) {
      throw new Error('Not authenticated');
    }
    return { userId: auth.userId, token: auth.token };
  }

  async function loadAll(userId: string): Promise<void> {
    const { token } = requireAuth();
    loading.value = true;
    error.value = null;

    try {
      const todos = await fetchTodos(userId, token);
      const normalized = normalize(todos);
      entities.value = normalized.entities;
      ids.value = normalized.ids;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load todos';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleOptimistic(id: string): Promise<void> {
    const todo = entities.value[id];
    if (!todo) {
      return;
    }

    const { userId, token } = requireAuth();
    const prev = todo.completed;
    entities.value[id] = { ...todo, completed: !prev };

    try {
      const updated = await updateTodo(
        { id, completed: !prev },
        userId,
        token,
        { mockToggleError: todo.task.startsWith('[500]') }
      );
      entities.value[id] = updated;
    } catch {
      entities.value[id] = { ...todo, completed: prev };
      throw new Error('Failed to toggle todo');
    }
  }

  async function addTodo(task: string): Promise<void> {
    const { userId, token } = requireAuth();
    const created = await createTodo(task, userId, token);
    entities.value[created.id] = created;
    ids.value = [...ids.value, created.id];
  }

  async function removeTodo(todoId: string): Promise<void> {
    const { userId, token } = requireAuth();
    await deleteTodo(todoId, userId, token);
    const { [todoId]: _removed, ...rest } = entities.value;
    entities.value = rest;
    ids.value = ids.value.filter((id) => id !== todoId);
  }

  function $reset(): void {
    entities.value = {};
    ids.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    entities,
    ids,
    loading,
    error,
    allTodos,
    filteredTodos,
    loadAll,
    toggleOptimistic,
    addTodo,
    removeTodo,
    $reset,
  };
});
