import { computed, inject } from 'vue';
import type { TodoRepository } from '@shared/data-access';
import {
  TODO_REPOSITORY,
  createJsonServerTodoRepository,
} from '@/services/json-server-todo.repository';
import { useAuthStore } from '@/stores/auth';
import { useTodosStore } from '@/stores/todos';

export interface UseTodosOptions {
  /** Test override — prefer provide(TODO_REPOSITORY) in app. */
  repository?: TodoRepository;
}

/**
 * Feature composable — views call this only.
 * Pinia = sync state; repository = HTTP; this hook = orchestration.
 */
export function useTodos(options?: UseTodosOptions) {
  const store = useTodosStore();
  const auth = useAuthStore();
  const injected = inject(TODO_REPOSITORY, null);
  const repo =
    options?.repository ?? injected ?? createJsonServerTodoRepository();

  async function load(): Promise<void> {
    if (!auth.userId) {
      store.setAll([]);
      return;
    }

    store.setLoading(true);
    store.setError(null);

    try {
      const todos = await repo.getAll(auth.userId);
      store.setAll(todos);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load todos';
      store.setError(message);
      throw err;
    } finally {
      store.setLoading(false);
    }
  }

  async function add(task: string): Promise<void> {
    if (!auth.userId) {
      throw new Error('Not authenticated');
    }

    store.beginMutation();
    store.setError(null);

    try {
      const created = await repo.create({ task, userId: auth.userId });
      store.upsert(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add todo';
      store.setError(message);
      throw err;
    } finally {
      store.endMutation();
    }
  }

  async function toggle(id: string): Promise<void> {
    const previous = store.items.find((item) => item.id === id);
    if (!previous) {
      throw new Error(`Todo not found: ${id}`);
    }

    store.beginMutation();
    store.setError(null);
    store.patchTodo(id, { completed: !previous.completed });

    try {
      const updated = await repo.update({
        ...previous,
        completed: !previous.completed,
      });
      store.upsert(updated);
    } catch (err) {
      store.upsert(previous);
      const message =
        err instanceof Error ? err.message : 'Failed to update todo';
      store.setError(message);
      throw err;
    } finally {
      store.endMutation();
    }
  }

  async function remove(id: string): Promise<void> {
    const previous = store.items.find((item) => item.id === id);
    if (!previous) {
      throw new Error(`Todo not found: ${id}`);
    }

    store.beginMutation();
    store.setError(null);
    store.removeTodo(id);

    try {
      await repo.delete(id);
    } catch (err) {
      store.upsert(previous);
      const message =
        err instanceof Error ? err.message : 'Failed to delete todo';
      store.setError(message);
      throw err;
    } finally {
      store.endMutation();
    }
  }

  return {
    todos: computed(() => store.allTodos),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    mutating: computed(() => store.mutating),
    load,
    add,
    toggle,
    remove,
  };
}
