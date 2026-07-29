import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import { Todo, TodoFilter, TodoTreeNode, TodosState } from './todo.model';
import { applyTodoFilter } from './todo-filter.strategy';
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

/**
 * Parametric filter selector — one memoized instance per `TodoFilter` value.
 * Prefer this over re-filtering in components when reading domain todos.
 */
const selectFilteredTodosByStatus = {
  all: createSelector(selectAllTodos, (todos) => applyTodoFilter(todos, 'all')),
  active: createSelector(selectAllTodos, (todos) =>
    applyTodoFilter(todos, 'active')
  ),
  done: createSelector(selectAllTodos, (todos) =>
    applyTodoFilter(todos, 'done')
  ),
} as const;

export const selectFilteredTodos = (filter: TodoFilter) =>
  selectFilteredTodosByStatus[filter];

type TodosByTagSelector = MemoizedSelector<object, Todo[]>;

const todosByTagSelectors = new Map<string, TodosByTagSelector>();

export const selectTodosByTag = (tag: string): TodosByTagSelector => {
  const cached = todosByTagSelectors.get(tag);
  if (cached) {
    return cached;
  }

  const selector = createSelector(selectAllTodos, (todos) =>
    todos.filter((todo) => todo.tags.includes(tag))
  );
  todosByTagSelectors.set(tag, selector);
  return selector;
};

export const selectAllTags = createSelector(selectAllTodos, (todos) =>
  [...new Set(todos.flatMap((todo) => todo.tags))].sort()
);

export function buildTodoTree(todos: readonly Todo[]): TodoTreeNode[] {
  const byParent = new Map<string | undefined, Todo[]>();

  for (const todo of todos) {
    const key = todo.parentId;
    if (!byParent.has(key)) {
      byParent.set(key, []);
    }
    byParent.get(key)!.push(todo);
  }

  const build = (parentId: string | undefined): TodoTreeNode[] =>
    (byParent.get(parentId) ?? []).map((todo) => ({
      ...todo,
      children: build(todo.id),
    }));

  return build(undefined);
}

export const selectTodoTree = createSelector(selectAllTodos, buildTodoTree);
