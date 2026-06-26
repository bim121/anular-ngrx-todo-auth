import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import * as api from '@/core/api';
import { useAuthStore } from './auth';
import { useTodosStore } from './todos';

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

describe('useTodosStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();

    const auth = useAuthStore();
    auth.$patch({
      token: 'mock-token',
      userId: 'user-1',
      userName: 'Test User',
    });
  });

  it('loadAll normalizes todos into entities and allTodos', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);

    const store = useTodosStore();
    await store.loadAll('user-1');

    expect(api.fetchTodos).toHaveBeenCalledWith('user-1', 'mock-token');
    expect(store.ids).toEqual(['1', '2']);
    expect(store.allTodos).toEqual(mockTodos);
    expect(store.loading).toBe(false);
  });

  it('toggleOptimistic rolls back completed state on patch error', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(api.updateTodo).mockRejectedValue(new Error('Mock toggle failure'));

    const store = useTodosStore();
    await store.loadAll('user-1');

    await expect(store.toggleOptimistic('1')).rejects.toThrow(
      'Failed to toggle todo'
    );

    expect(store.entities['1']?.completed).toBe(false);
    expect(api.updateTodo).toHaveBeenCalledWith(
      { id: '1', completed: true },
      'user-1',
      'mock-token',
      { mockToggleError: false }
    );
  });

  it('toggleOptimistic keeps optimistic state on success', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(api.updateTodo).mockResolvedValue({
      ...mockTodos[0],
      completed: true,
    });

    const store = useTodosStore();
    await store.loadAll('user-1');
    await store.toggleOptimistic('1');

    expect(store.entities['1']?.completed).toBe(true);
  });
});

describe('useAuthStore logout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('resets todos store on logout', async () => {
    vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);

    const auth = useAuthStore();
    auth.$patch({
      token: 'mock-token',
      userId: 'user-1',
      userName: 'Test User',
    });

    const todos = useTodosStore();
    await todos.loadAll('user-1');
    expect(todos.allTodos).toHaveLength(2);

    auth.logout();

    expect(todos.allTodos).toHaveLength(0);
    expect(todos.ids).toEqual([]);
  });
});
