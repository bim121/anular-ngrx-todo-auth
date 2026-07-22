import { beforeEach, describe, expect, it } from 'vitest';
import { MockTodoRepository } from './mock-todo.repository';

describe('MockTodoRepository', () => {
  let repo: MockTodoRepository;

  beforeEach(() => {
    repo = new MockTodoRepository([
      {
        id: '1',
        userId: 'user-1',
        task: 'Mine',
        completed: false,
      },
      {
        id: '2',
        userId: 'user-2',
        task: 'Theirs',
        completed: false,
      },
    ]);
  });

  it('getAll filters by userId', async () => {
    await expect(repo.getAll('user-1')).resolves.toEqual([
      {
        id: '1',
        userId: 'user-1',
        task: 'Mine',
        completed: false,
      },
    ]);
  });

  it('create / update / delete mutate in-memory state', async () => {
    const created = await repo.create({ task: 'Another', userId: 'user-1' });
    expect(created.completed).toBe(false);

    const updated = await repo.update({ ...created, completed: true });
    expect(updated.completed).toBe(true);

    await repo.delete(created.id);
    const remaining = await repo.getAll('user-1');
    expect(remaining.map((todo) => todo.id)).toEqual(['1']);
  });
});
