import { createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';
import { Todo, TodosState } from './todo.model';
import * as TodoActions from './todo.actions';

export const todosFeatureKey = 'todos';

export const todosAdapter = createEntityAdapter<Todo>({
  selectId: (todo) => todo.id,
});

export const initialTodoState: TodosState = todosAdapter.getInitialState({
  loading: false,
  error: null,
  pendingToggleIds: [],
});

export const todosReducer = createReducer(
  initialTodoState,

  on(TodoActions.loadTodos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TodoActions.loadTodosSuccess, (state, { todos }) =>
    todosAdapter.setAll(todos, {
      ...state,
      loading: false,
    })
  ),

  on(TodoActions.loadTodosFailure, (state, { error }) => ({
    ...state,
    error: error instanceof Error ? error.message : 'Failed to load messages',
    loading: false,
  })),

  on(TodoActions.addTodo, (state) => ({
    ...state,
    error: null,
  })),

  on(TodoActions.addTodoSuccess, (state, { todo }) =>
    todosAdapter.addOne(todo, state)
  ),

  on(TodoActions.addTodoFailure, (state, { error }) => ({
    ...state,
    error: error instanceof Error ? error.message : 'Failed to add messages',
  })),

  on(TodoActions.updateTodo, (state, { todo }) =>
    todosAdapter.updateOne(
      { id: todo.id, changes: todo },
      { ...state, error: null }
    )
  ),

  on(TodoActions.updateTodoSuccess, (state, { todo }) =>
    todosAdapter.updateOne({ id: todo.id, changes: todo }, state)
  ),

  on(TodoActions.updateTodoFailure, (state, { error }) => ({
    ...state,
    error: error instanceof Error ? error.message : 'Failed to update messages',
  })),

  on(TodoActions.deleteTodo, (state) => ({
    ...state,
    error: null,
  })),

  on(TodoActions.deleteTodoSuccess, (state, { todoId }) =>
    todosAdapter.removeOne(todoId, state)
  ),

  on(TodoActions.deleteTodoFailure, (state, { error }) => ({
    ...state,
    error: error instanceof Error ? error.message : 'Failed to delete messages',
  })),

  on(TodoActions.toggleTodoOptimistic, (state, { id }) => {
    const todo = state.entities[id];
    if (!todo) {
      return state;
    }

    return todosAdapter.updateOne(
      { id, changes: { completed: !todo.completed } },
      {
        ...state,
        error: null,
        pendingToggleIds: state.pendingToggleIds.includes(id)
          ? state.pendingToggleIds
          : [...state.pendingToggleIds, id],
      }
    );
  }),

  on(TodoActions.toggleTodoSuccess, (state, { todo }) =>
    todosAdapter.updateOne(
      { id: todo.id, changes: todo },
      {
        ...state,
        pendingToggleIds: state.pendingToggleIds.filter(
          (pendingId) => pendingId !== todo.id
        ),
      }
    )
  ),

  on(TodoActions.toggleTodoFailure, (state, { id, previousCompleted }) =>
    todosAdapter.updateOne(
      { id, changes: { completed: previousCompleted } },
      {
        ...state,
        pendingToggleIds: state.pendingToggleIds.filter(
          (pendingId) => pendingId !== id
        ),
      }
    )
  ),

  on(AuthActions.logoutUser, () => initialTodoState)
);

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal,
} = todosAdapter.getSelectors();
