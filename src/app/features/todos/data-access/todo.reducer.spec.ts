import {
  initialTodoState,
  selectAll,
  todosAdapter,
  todosReducer,
} from './todo.reducer';
import * as TodoActions from './todo.actions';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { Todo } from './todo.model';

describe('todosReducer', () => {
  const t1: Todo = { id: '1', userId: 'u1', task: 'A', completed: false };
  const t2: Todo = { id: '2', userId: 'u1', task: 'B', completed: false };

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
    expect(items[0]).toEqual(serverTodo);
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
