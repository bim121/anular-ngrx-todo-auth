import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodosState } from './todo.model';
import {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal,
  todosAdapter,
  todosFeatureKey,
} from './todo.reducer';

export { todosAdapter };

export const selectTodosState =
  createFeatureSelector<TodosState>(todosFeatureKey);

export const selectAllTodos = createSelector(selectTodosState, selectAll);

export const selectTodoEntities = createSelector(
  selectTodosState,
  selectEntities
);

export const selectTodoIds = createSelector(selectTodosState, selectIds);

export const selectTodosTotal = createSelector(selectTodosState, selectTotal);

export const selectTodosLoading = createSelector(
  selectTodosState,
  (state) => state.loading
);

export const selectTodosError = createSelector(
  selectTodosState,
  (state) => state.error
);

export const selectPendingToggleIds = createSelector(
  selectTodosState,
  (state) => state.pendingToggleIds
);

export const selectIsTodoTogglePending = (id: string) =>
  createSelector(selectPendingToggleIds, (ids) => ids.includes(id));

export const selectTodoById = (id: string) =>
  createSelector(selectTodoEntities, (entities) => entities[id]);
