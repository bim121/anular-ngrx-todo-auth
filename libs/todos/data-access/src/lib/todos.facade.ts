import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  Todo,
  TodoFilter,
  TodoStatus,
  kanbanStatusPatch,
} from './todo.model';
import * as TodoActions from './todo.actions';
import {
  selectAllTags,
  selectAllTodos,
  selectFilteredTodos,
  selectPendingToggleIds,
  selectTodosByKanbanStatus,
  selectTodosError,
  selectTodosLoading,
  selectTodosWithDueDate,
  selectWeeklyCompletionStats,
} from './todo.selectors';

/**
 * Thin API over NgRx todos state for UI layers (pages).
 * Commands dispatch actions; queries expose signals — no Store in pages.
 */
@Injectable({ providedIn: 'root' })
export class TodosFacade {
  private readonly store = inject(Store);

  readonly todos = toSignal(this.store.select(selectAllTodos), {
    initialValue: [] as Todo[],
  });

  /** Memoized per filter value via `selectFilteredTodos` (Phase 5.4.1). */
  private readonly filteredByStatus = {
    all: toSignal(this.store.select(selectFilteredTodos('all')), {
      initialValue: [] as Todo[],
    }),
    active: toSignal(this.store.select(selectFilteredTodos('active')), {
      initialValue: [] as Todo[],
    }),
    done: toSignal(this.store.select(selectFilteredTodos('done')), {
      initialValue: [] as Todo[],
    }),
  } as const;

  private readonly kanbanByStatus = {
    todo: toSignal(this.store.select(selectTodosByKanbanStatus('todo')), {
      initialValue: [] as Todo[],
    }),
    'in-progress': toSignal(
      this.store.select(selectTodosByKanbanStatus('in-progress')),
      { initialValue: [] as Todo[] }
    ),
    done: toSignal(this.store.select(selectTodosByKanbanStatus('done')), {
      initialValue: [] as Todo[],
    }),
  } as const;

  readonly availableTags = toSignal(this.store.select(selectAllTags), {
    initialValue: [] as string[],
  });
  readonly loading = toSignal(this.store.select(selectTodosLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(selectTodosError), {
    initialValue: null as string | null,
  });
  readonly pendingToggleIds = toSignal(
    this.store.select(selectPendingToggleIds),
    { initialValue: [] as string[] }
  );
  readonly weeklyStats = toSignal(
    this.store.select(selectWeeklyCompletionStats),
    { initialValue: [] }
  );
  readonly todosWithDueDate = toSignal(
    this.store.select(selectTodosWithDueDate),
    { initialValue: [] as Todo[] }
  );

  /** Domain filter (all/active/done) — NgRx-memoized; UI chip lives in SignalStore. */
  filteredTodos(filter: TodoFilter): Todo[] {
    return this.filteredByStatus[filter]();
  }

  /** Kanban column contents (PF-3.3). */
  todosByKanbanStatus(status: TodoStatus): Todo[] {
    return this.kanbanByStatus[status]();
  }

  /**
   * Load / revalidate todos.
   * If the store already has items, they stay visible while the request runs (SWR).
   * HTTP layer may serve a fresh cache hit or stale-then-network (see docs/perf/http-cache.md).
   */
  load(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  add(task: string): void {
    this.store.dispatch(TodoActions.addTodo({ task }));
  }

  update(todo: Partial<Todo> & { id: string }): void {
    this.store.dispatch(TodoActions.updateTodo({ todo }));
  }

  /** Optimistic Kanban column move — patches status + completed. */
  moveToStatus(id: string, status: TodoStatus): void {
    this.store.dispatch(
      TodoActions.updateTodo({
        todo: { id, ...kanbanStatusPatch(status) },
      })
    );
  }

  remove(id: string): void {
    this.store.dispatch(TodoActions.deleteTodo({ todoId: id }));
  }

  /** Optimistic flip + request; pending ids come from `pendingToggleIds`. */
  toggle(id: string): void {
    this.store.dispatch(TodoActions.toggleTodoOptimistic({ id }));
    this.store.dispatch(TodoActions.toggleTodo({ id }));
  }

  isTogglePending(id: string): boolean {
    return this.pendingToggleIds().includes(id);
  }
}
