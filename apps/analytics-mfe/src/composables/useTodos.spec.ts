import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { MockTodoRepository, type Todo } from '@shared/data-access';
import { useTodos } from '@/composables/useTodos';
import { useLogout } from '@/composables/useLogout';
import { useAuthStore } from '@/stores/auth';
import { useTodosStore } from '@/stores/todos';

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

function setupAuth(): void {
  const auth = useAuthStore();
  auth.$patch({
    token: 'mock-token',
    userId: 'user-1',
    userName: 'Test User',
  });
}

describe('useTodos with MockTodoRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    setupAuth();
  });

  it('loads todos without hitting json-server', async () => {
    const repo = new MockTodoRepository(seed);
    const todosApi = useTodos({ repository: repo });

    await todosApi.load();

    expect(todosApi.todos.value).toEqual(seed);
    expect(todosApi.loading.value).toBe(false);
  });

  it('adds a todo through the mock repository', async () => {
    const repo = new MockTodoRepository(seed);
    const todosApi = useTodos({ repository: repo });

    await todosApi.load();
    await todosApi.add('New from test');

    expect(
      todosApi.todos.value.some((todo) => todo.task === 'New from test')
    ).toBe(true);
    expect(repo.snapshot()).toHaveLength(3);
  });

  it('rolls back optimistic toggle when repository update fails', async () => {
    const repo = new MockTodoRepository(seed);
    repo.update = async () => {
      throw new Error('Mock toggle failure');
    };

    const todosApi = useTodos({ repository: repo });
    await todosApi.load();

    await expect(todosApi.toggle('1')).rejects.toThrow('Mock toggle failure');
    expect(todosApi.todos.value.find((todo) => todo.id === '1')?.completed).toBe(
      false
    );
  });

  it('keeps toggled state after successful update', async () => {
    const repo = new MockTodoRepository(seed);
    const todosApi = useTodos({ repository: repo });

    await todosApi.load();
    await todosApi.toggle('1');

    expect(todosApi.todos.value.find((todo) => todo.id === '1')?.completed).toBe(
      true
    );
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    setupAuth();
  });

  it('clears auth and todos store', async () => {
    const repo = new MockTodoRepository(seed);
    const todosApi = useTodos({ repository: repo });
    await todosApi.load();

    expect(useTodosStore().allTodos).toHaveLength(2);

    useLogout()();

    expect(useAuthStore().token).toBeNull();
    expect(useTodosStore().allTodos).toHaveLength(0);
  });
});
