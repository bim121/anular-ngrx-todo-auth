import {
  initialTodoState,
  todosAdapter,
  todosFeatureKey,
} from './todo.reducer';
import { selectTodoById } from './todo.selectors';
import { Todo } from './todo.model';

describe('todo selectors', () => {
  const t1: Todo = { id: '1', userId: 'u1', task: 'A', completed: false };
  const t2: Todo = { id: '2', userId: 'u1', task: 'B', completed: true };

  const buildRootState = () => ({
    [todosFeatureKey]: todosAdapter.setAll([t1, t2], initialTodoState),
  });

  it('selectTodoById returns the matching entity', () => {
    const state = buildRootState();

    expect(selectTodoById('1')(state)).toEqual(t1);
    expect(selectTodoById('2')(state)).toEqual(t2);
  });

  it('selectTodoById returns undefined for unknown id', () => {
    const state = buildRootState();

    expect(selectTodoById('missing')(state)).toBeUndefined();
  });
});
