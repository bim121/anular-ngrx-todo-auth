import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Todo } from '@shared/data-access';

/**
 * Todos client state only — sync mutations.
 * HTTP lives in TodoRepository; orchestration in useTodos().
 */
export const useTodosStore = defineStore('todos', () => {
  const items = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pendingCount = ref(0);

  const allTodos = computed(() => items.value);
  const mutating = computed(() => pendingCount.value > 0);

  function setAll(todos: Todo[]): void {
    items.value = todos.map((todo) => ({ ...todo }));
  }

  function setLoading(value: boolean): void {
    loading.value = value;
  }

  function setError(value: string | null): void {
    error.value = value;
  }

  function beginMutation(): void {
    pendingCount.value += 1;
  }

  function endMutation(): void {
    pendingCount.value = Math.max(0, pendingCount.value - 1);
  }

  function upsert(todo: Todo): void {
    const index = items.value.findIndex((item) => item.id === todo.id);
    if (index < 0) {
      items.value = [...items.value, { ...todo }];
      return;
    }
    const next = items.value.slice();
    next[index] = { ...todo };
    items.value = next;
  }

  function patchTodo(id: string, patch: Partial<Todo>): Todo | null {
    const current = items.value.find((item) => item.id === id);
    if (!current) {
      return null;
    }
    const updated = { ...current, ...patch };
    upsert(updated);
    return updated;
  }

  function removeTodo(id: string): void {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function clear(): void {
    items.value = [];
    loading.value = false;
    error.value = null;
    pendingCount.value = 0;
  }

  return {
    items,
    allTodos,
    loading,
    error,
    mutating,
    setAll,
    setLoading,
    setError,
    beginMutation,
    endMutation,
    upsert,
    patchTodo,
    removeTodo,
    clear,
  };
});
