import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import * as api from '@/core/api';
import { todoQueryKey } from '@/core/query-client';
import { useLogout } from '@/composables/useLogout';
import {
  useToggleTodoMutation,
  useTodosQuery,
} from '@/features/todos/useTodosQuery';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/core/api', () => ({
  fetchTodos: vi.fn(),
  updateTodo: vi.fn(),
  createTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const mockTodos: api.Todo[] = [
  {
    id: '1',
    userId: 'user-1',
    task: 'First task',
    completed: false,
  },
  {
    id: '2',
    userId: 'user-1',
    task: 'Second task',
    completed: true,
  },
];

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function withQuerySetup<T>(run: () => T): { result: T; queryClient: QueryClient } {
  const queryClient = createTestQueryClient();
  const pinia = createPinia();
  setActivePinia(pinia);

  let result!: T;
  const app = createApp({
    setup() {
      result = run();
      return () => null;
    },
  });

  app.use(pinia);
  app.use(VueQueryPlugin, { queryClient });
  app.mount(document.createElement('div'));

  return { result, queryClient };
}

describe('useTodosQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads todos for the authenticated user', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);

    const { result } = withQuerySetup(() => {
      const auth = useAuthStore();
      auth.$patch({
        token: 'mock-token',
        userId: 'user-1',
        userName: 'Test User',
      });
      return useTodosQuery();
    });

    await vi.waitFor(() => expect(result.isSuccess.value).toBe(true));

    expect(api.fetchTodos).toHaveBeenCalledWith('user-1', 'mock-token');
    expect(result.data.value).toEqual(mockTodos);
  });
});

describe('useToggleTodoMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rolls back optimistic toggle on patch error', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(api.updateTodo).mockRejectedValue(new Error('Mock toggle failure'));

    const { result, queryClient } = withQuerySetup(() => {
      const auth = useAuthStore();
      auth.$patch({
        token: 'mock-token',
        userId: 'user-1',
        userName: 'Test User',
      });
      return {
        query: useTodosQuery(),
        toggle: useToggleTodoMutation(),
      };
    });

    await vi.waitFor(() => expect(result.query.isSuccess.value).toBe(true));

    const todo = mockTodos[0];
    await expect(result.toggle.mutateAsync(todo)).rejects.toThrow(
      'Mock toggle failure'
    );
    await nextTick();

    expect(queryClient.getQueryData(todoQueryKey('user-1'))).toEqual(mockTodos);
    expect(api.updateTodo).toHaveBeenCalledWith(
      { id: '1', completed: true },
      'user-1',
      'mock-token',
      { mockToggleError: false }
    );
  });

  it('keeps toggled state after successful mutation and refetch', async () => {
    vi.mocked(api.fetchTodos)
      .mockResolvedValueOnce(mockTodos)
      .mockResolvedValue([
        { ...mockTodos[0], completed: true },
        mockTodos[1],
      ]);
    vi.mocked(api.updateTodo).mockResolvedValue({
      ...mockTodos[0],
      completed: true,
    });

    const { result, queryClient } = withQuerySetup(() => {
      const auth = useAuthStore();
      auth.$patch({
        token: 'mock-token',
        userId: 'user-1',
        userName: 'Test User',
      });
      return {
        query: useTodosQuery(),
        toggle: useToggleTodoMutation(),
      };
    });

    await vi.waitFor(() => expect(result.query.isSuccess.value).toBe(true));
    await result.toggle.mutateAsync(mockTodos[0]);

    await vi.waitFor(() => {
      const cached = queryClient.getQueryData<api.Todo[]>(
        todoQueryKey('user-1')
      );
      expect(cached?.find((item) => item.id === '1')?.completed).toBe(true);
    });
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('clears query cache on logout', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);

    const { result, queryClient } = withQuerySetup(() => {
      const auth = useAuthStore();
      auth.$patch({
        token: 'mock-token',
        userId: 'user-1',
        userName: 'Test User',
      });
      return {
        query: useTodosQuery(),
        logout: useLogout(),
      };
    });

    await vi.waitFor(() => expect(result.query.isSuccess.value).toBe(true));
    expect(queryClient.getQueryData(todoQueryKey('user-1'))).toEqual(mockTodos);

    result.logout();

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(useAuthStore().token).toBeNull();
  });
});
