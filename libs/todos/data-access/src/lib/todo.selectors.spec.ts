import {
  initialTodoState,
  todosAdapter,
  todosFeatureKey,
} from './todo.reducer';
import {
  buildTodoTree,
  selectAllTags,
  selectFilteredTodos,
  selectTodoById,
  selectTodoTree,
  selectTodosByTag,
  selectWeeklyCompletionStats,
} from './todo.selectors';
import { Todo } from './todo.model';

describe('todo selectors', () => {
  const t1: Todo = {
    id: '1',
    userId: 'u1',
    task: 'A',
    completed: false,
    tags: ['work', 'ngrx'],
    priority: 'high',
  };
  const t2: Todo = {
    id: '2',
    userId: 'u1',
    task: 'B',
    completed: true,
    tags: ['work'],
    priority: 'low',
  };
  const sub: Todo = {
    id: '1-sub',
    userId: 'u1',
    task: 'Subtask',
    completed: false,
    tags: ['ngrx'],
    priority: 'medium',
    parentId: '1',
  };

  const buildRootState = (todos: Todo[]) => ({
    [todosFeatureKey]: todosAdapter.setAll(todos, initialTodoState),
  });

  it('selectTodoById returns the matching entity', () => {
    const state = buildRootState([t1, t2]);

    expect(selectTodoById('1')(state)).toEqual(t1);
    expect(selectTodoById('2')(state)).toEqual(t2);
  });

  it('selectTodoById returns undefined for unknown id', () => {
    const state = buildRootState([t1, t2]);

    expect(selectTodoById('missing')(state)).toBeUndefined();
  });

  it('selectTodosByTag filters todos by tag', () => {
    const state = buildRootState([t1, t2, sub]);

    expect(selectTodosByTag('ngrx')(state)).toEqual([t1, sub]);
    expect(selectTodosByTag('work')(state)).toEqual([t1, t2]);
  });

  it('selectTodosByTag reuses the same selector instance per tag', () => {
    expect(selectTodosByTag('ngrx')).toBe(selectTodosByTag('ngrx'));
    expect(selectTodosByTag('ngrx')).not.toBe(selectTodosByTag('work'));
  });

  it('selectFilteredTodos filters by completion status', () => {
    const state = buildRootState([t1, t2, sub]);

    expect(selectFilteredTodos('all')(state)).toEqual([t1, t2, sub]);
    expect(selectFilteredTodos('active')(state).map((t) => t.id)).toEqual([
      '1',
      '1-sub',
    ]);
    expect(selectFilteredTodos('done')(state).map((t) => t.id)).toEqual(['2']);
  });

  it('selectFilteredTodos reuses one selector instance per filter', () => {
    expect(selectFilteredTodos('active')).toBe(selectFilteredTodos('active'));
    expect(selectFilteredTodos('active')).not.toBe(selectFilteredTodos('done'));
  });

  it('selectAllTags returns sorted unique tags', () => {
    const state = buildRootState([t1, t2, sub]);

    expect(selectAllTags(state)).toEqual(['ngrx', 'work']);
  });

  it('buildTodoTree nests subtasks under parent', () => {
    const tree = buildTodoTree([t1, t2, sub]);

    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe('1');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe('1-sub');
  });

  it('selectWeeklyCompletionStats groups completed todos into last 8 weeks', () => {
    const doneThisWeek: Todo = {
      ...t1,
      id: 'done-now',
      completed: true,
      completedAt: new Date().toISOString(),
    };
    const state = buildRootState([doneThisWeek, t2]);
    const buckets = selectWeeklyCompletionStats(state);

    expect(buckets).toHaveLength(8);
    expect(buckets.reduce((sum, b) => sum + b.completed, 0)).toBeGreaterThanOrEqual(1);
  });
});
