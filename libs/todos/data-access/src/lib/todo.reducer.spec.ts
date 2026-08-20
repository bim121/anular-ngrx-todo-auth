import {
  initialTodoState,
  selectAll,
  todosAdapter,
  todosReducer,
} from './todo.reducer';
import * as TodoActions from './todo.actions';
import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';
import { Todo } from './todo.model';

describe('todosReducer', () => {
  const t1: Todo = {
    id: '1',
    userId: 'u1',
    task: 'A',
    completed: false,
    status: 'todo',
    tags: [],
    priority: 'medium',
  };
  const t2: Todo = {
    id: '2',
    userId: 'u1',
    task: 'B',
    completed: false,
    status: 'todo',
    tags: [],
    priority: 'medium',
  };

  it('returns initial state for unknown action', () => {
    const state = todosReducer(undefined, { type: 'NOOP' } as never);
    expect(state).toEqual(initialTodoState);
  });

  it('loadTodos: sets loading and clears error when store is empty', () => {
    const state = todosReducer(
      { ...initialTodoState, error: 'old' },
      TodoActions.loadTodos()
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadTodos: keeps loading false when entities already exist (SWR soft refresh)', () => {
    const withTodos = todosAdapter.setAll(
      [t1],
      { ...initialTodoState, loading: false }
    );
    const state = todosReducer(withTodos, TodoActions.loadTodos());

    expect(state.loading).toBe(false);
    expect(state.ids).toContain(t1.id);
  });

  it('loadTodosSuccess: replaces entity collection', () => {
    const state = todosReducer(
      { ...initialTodoState, loading: true },
      TodoActions.loadTodosSuccess({ todos: [t1, t2] })
    );

    expect(selectAll(state)).toEqual([t1, t2]);
    expect(state.loading).toBe(false);
  });

  it('loadTodosFailure: stores Error message', () => {
    const state = todosReducer(
      { ...initialTodoState, loading: true },
      TodoActions.loadTodosFailure({ error: new Error('network') })
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('network');
  });

  it('loadTodosFailure: falls back when error is not Error', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.loadTodosFailure({ error: 'fail' })
    );

    expect(state.error).toBe('Failed to load messages');
  });

  it('addTodo: clears error', () => {
    const state = todosReducer(
      { ...initialTodoState, error: 'old' },
      TodoActions.addTodo({ task: 'New' })
    );

    expect(state.error).toBeNull();
  });

  it('addTodoSuccess: adds entity', () => {
    const state = todosReducer(initialTodoState, TodoActions.addTodoSuccess({ todo: t1 }));

    expect(selectAll(state)).toEqual([t1]);
  });

  it('addTodoFailure: stores Error message', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.addTodoFailure({ error: new Error('denied') })
    );

    expect(state.error).toBe('denied');
  });

  it('addTodoFailure: falls back when error is not Error', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.addTodoFailure({ error: 'fail' })
    );

    expect(state.error).toBe('Failed to add messages');
  });

  it('updateTodo: optimistically updates the matching item', () => {
    const startState = todosAdapter.setAll([t1, t2], initialTodoState);

    const state = todosReducer(
      startState,
      TodoActions.updateTodo({ todo: { ...t1, task: 'A edited' } })
    );

    const items = selectAll(state);
    expect(items[0].task).toBe('A edited');
    expect(items[1]).toEqual(t2);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('updateTodoSuccess: replaces only the matching item by id', () => {
    const startState = todosAdapter.setAll([t1, t2], initialTodoState);

    const updated: Todo = { ...t1, task: 'A updated', completed: true };
    const state = todosReducer(
      startState,
      TodoActions.updateTodoSuccess({ todo: updated })
    );

    const items = selectAll(state);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(updated);
    expect(items[1]).toEqual(t2);
    expect(state.loading).toBe(false);
  });

  it('updateTodoFailure: stores Error message', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.updateTodoFailure({ error: new Error('conflict') })
    );

    expect(state.error).toBe('conflict');
  });

  it('updateTodoFailure: falls back when error is not Error', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.updateTodoFailure({ error: 'fail' })
    );

    expect(state.error).toBe('Failed to update messages');
  });

  it('deleteTodo: clears error', () => {
    const state = todosReducer(
      { ...initialTodoState, error: 'old' },
      TodoActions.deleteTodo({ todoId: t1.id })
    );

    expect(state.error).toBeNull();
  });

  it('deleteTodoSuccess: removes entity', () => {
    const startState = todosAdapter.setAll([t1, t2], initialTodoState);
    const state = todosReducer(
      startState,
      TodoActions.deleteTodoSuccess({ todoId: t1.id })
    );

    expect(selectAll(state)).toEqual([t2]);
  });

  it('deleteTodoFailure: stores Error message', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.deleteTodoFailure({ error: new Error('forbidden') })
    );

    expect(state.error).toBe('forbidden');
  });

  it('deleteTodoFailure: falls back when error is not Error', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.deleteTodoFailure({ error: 'fail' })
    );

    expect(state.error).toBe('Failed to delete messages');
  });

  it('toggleTodoOptimistic: flips completed and tracks pending id', () => {
    const startState = todosAdapter.setAll([t1, t2], initialTodoState);

    const state = todosReducer(
      startState,
      TodoActions.toggleTodoOptimistic({ id: t1.id })
    );

    const items = selectAll(state);
    expect(items[0].completed).toBe(true);
    expect(items[1]).toEqual(t2);
    expect(state.pendingToggleIds).toEqual([t1.id]);
  });

  it('toggleTodoOptimistic: returns same state when todo is missing', () => {
    const state = todosReducer(
      initialTodoState,
      TodoActions.toggleTodoOptimistic({ id: 'missing' })
    );

    expect(state).toBe(initialTodoState);
  });

  it('toggleTodoOptimistic: does not duplicate pending id', () => {
    const startState = {
      ...todosAdapter.setAll([t1], initialTodoState),
      pendingToggleIds: [t1.id],
    };

    const state = todosReducer(
      startState,
      TodoActions.toggleTodoOptimistic({ id: t1.id })
    );

    expect(state.pendingToggleIds).toEqual([t1.id]);
  });

  it('toggleTodoFailure: rolls back completed and clears pending id', () => {
    const optimisticState = todosReducer(
      todosAdapter.setAll([t1, t2], initialTodoState),
      TodoActions.toggleTodoOptimistic({ id: t1.id })
    );

    const state = todosReducer(
      optimisticState,
      TodoActions.toggleTodoFailure({
        id: t1.id,
        previousCompleted: false,
        error: new Error('network'),
      })
    );

    const items = selectAll(state);
    expect(items[0].completed).toBe(false);
    expect(state.pendingToggleIds).toEqual([]);
  });

  it('toggleTodoOptimistic: sets completedAt when marking done', () => {
    const state = todosReducer(
      todosAdapter.setAll([t1], initialTodoState),
      TodoActions.toggleTodoOptimistic({ id: t1.id })
    );
    const items = selectAll(state);
    expect(items[0].completed).toBe(true);
    expect(items[0].completedAt).toBeTruthy();
  });

  it('toggleTodoSuccess: syncs server todo and clears pending id', () => {
    const optimisticState = todosReducer(
      todosAdapter.setAll([t1, t2], initialTodoState),
      TodoActions.toggleTodoOptimistic({ id: t1.id })
    );

    const serverTodo: Todo = { ...t1, completed: true };
    const state = todosReducer(
      optimisticState,
      TodoActions.toggleTodoSuccess({ todo: serverTodo })
    );

    const items = selectAll(state);
    expect(items[0].completed).toBe(true);
    expect(items[0].id).toBe(serverTodo.id);
    expect(state.pendingToggleIds).toEqual([]);
  });

  it('logoutUser: clears todos back to initial state', () => {
    const startState = todosAdapter.setAll([t1, t2], {
      ...initialTodoState,
      loading: true,
      error: 'something',
      pendingToggleIds: [t1.id],
    });

    const state = todosReducer(startState, AuthActions.logoutUser());

    expect(state).toEqual(initialTodoState);
  });
});
