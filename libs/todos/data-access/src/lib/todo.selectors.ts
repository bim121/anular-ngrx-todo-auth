import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import {
  Todo,
  TodoFilter,
  TodoStatus,
  TodoTreeNode,
  TodosState,
} from './todo.model';
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

const selectTodosByKanbanStatusMap = {
  todo: createSelector(selectAllTodos, (todos) =>
    todos.filter((t) => t.status === 'todo')
  ),
  'in-progress': createSelector(selectAllTodos, (todos) =>
    todos.filter((t) => t.status === 'in-progress')
  ),
  done: createSelector(selectAllTodos, (todos) =>
    todos.filter((t) => t.status === 'done')
  ),
} as const;

export const selectTodosByKanbanStatus = (status: TodoStatus) =>
  selectTodosByKanbanStatusMap[status];

/** Todos that have a dueDate (calendar). */
export const selectTodosWithDueDate = createSelector(selectAllTodos, (todos) =>
  todos.filter((t) => !!t.dueDate)
);

export interface WeeklyCompletionBucket {
  /** ISO week label, e.g. `2026-W30`. */
  weekLabel: string;
  completed: number;
}

/** Monday-based ISO week key for a Date. */
export function isoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Completions for the last 8 ISO weeks (memoized).
 * Uses `completedAt`, falling back to `createdAt` for legacy completed rows.
 */
export const selectWeeklyCompletionStats = createSelector(
  selectAllTodos,
  (todos): WeeklyCompletionBucket[] => {
    const now = new Date();
    const buckets = new Map<string, number>();

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      buckets.set(isoWeekLabel(d), 0);
    }

    for (const todo of todos) {
      if (!todo.completed) continue;
      const raw = todo.completedAt ?? todo.createdAt;
      if (!raw) continue;
      const label = isoWeekLabel(new Date(raw));
      if (buckets.has(label)) {
        buckets.set(label, (buckets.get(label) ?? 0) + 1);
      }
    }

    return [...buckets.entries()].map(([weekLabel, completed]) => ({
      weekLabel,
      completed,
    }));
  }
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
