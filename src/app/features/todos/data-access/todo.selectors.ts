import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TodosState } from "./todo.model";
import { todosFeatureKey } from "./todo.reducer";

export const selectTodosState = createFeatureSelector<TodosState>(todosFeatureKey);

export const selectAllTodos = createSelector(
    selectTodosState,
    (state) => state.items
);

export const selectTodosLoading = createSelector(
    selectTodosState,
    (state) => state.loading
);

export const selectTodosError = createSelector(
    selectTodosState,
    (state) => state.error
);