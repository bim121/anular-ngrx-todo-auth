import { todosReducer, initialTodoState } from './todo.reducer';
import * as TodoActions from './todo.actions';
import * as AuthActions from '../../auth/data-access/auth.actions';
import { Todo } from './todo.model';

describe('todosReducer', () => {
  const t1: Todo = { id: '1', userId: 'u1', task: 'A', completed: false };
  const t2: Todo = { id: '2', userId: 'u1', task: 'B', completed: false };

  it('updateTodoSuccess: replaces only the matching item by id', () => {
    const startState = {
      ...initialTodoState,
      items: [t1, t2],
    };

    const updated: Todo = { ...t1, task: 'A updated', completed: true };
    const state = todosReducer(
      startState,
      TodoActions.updateTodoSuccess({ todo: updated })
    );

    expect(state.items).toHaveLength(2);
    expect(state.items[0]).toEqual(updated);
    expect(state.items[1]).toEqual(t2);
    expect(state.loading).toBe(false);
  });

  it('logoutUser: clears todos back to initial state', () => {
    const startState = {
      ...initialTodoState,
      items: [t1, t2],
      loading: true,
      error: 'something',
    };

    const state = todosReducer(startState, AuthActions.logoutUser());

    expect(state).toEqual(initialTodoState);
  });
});
