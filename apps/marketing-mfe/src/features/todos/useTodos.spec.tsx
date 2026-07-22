import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockTodoRepository, type Todo } from '@shared/data-access';
import { TodoRepositoryProvider } from './todo-repository-context';
import { useTodos } from './useTodos';
import { useAuthStore } from '@marketing/stores/authStore';

const seed: Todo[] = [
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

function createWrapper(repository: MockTodoRepository) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TodoRepositoryProvider repository={repository}>
          {children}
        </TodoRepositoryProvider>
      </QueryClientProvider>
    );
  };
}

describe('useTodos with MockTodoRepository', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'mock-token',
      userId: 'user-1',
      userName: 'Test User',
    });
  });

  it('loads todos without hitting json-server', async () => {
    const repo = new MockTodoRepository(seed);
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(repo),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.todos).toEqual(seed);
  });

  it('adds a todo through the mock repository', async () => {
    const repo = new MockTodoRepository(seed);
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(repo),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.add('New from test');

    await waitFor(() =>
      expect(result.current.todos.some((todo) => todo.task === 'New from test')).toBe(
        true
      )
    );
    expect(repo.snapshot()).toHaveLength(3);
  });

  it('toggles a todo optimistically then settles on mock data', async () => {
    const repo = new MockTodoRepository(seed);
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(repo),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.toggle('1');

    await waitFor(() => {
      const updated = result.current.todos.find((todo) => todo.id === '1');
      expect(updated?.completed).toBe(true);
    });
  });
});
