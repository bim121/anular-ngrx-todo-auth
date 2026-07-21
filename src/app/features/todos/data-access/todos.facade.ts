import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Todo, TodoFilter } from './todo.model';
import * as TodoActions from './todo.actions';
import {
  selectAllTags,
  selectAllTodos,
  selectPendingToggleIds,
  selectTodosError,
  selectTodosLoading,
} from './todo.selectors';
import { TODO_FILTER_STRATEGIES } from './todo-filter.strategy';

/**
 * Thin API over NgRx todos state for UI layers (pages).
 * Commands dispatch actions; queries expose signals — no Store in pages.
 */
@Injectable({ providedIn: 'root' })
export class TodosFacade {
  private readonly store = inject(Store);
  private readonly filterStrategies = inject(TODO_FILTER_STRATEGIES);

  readonly todos = toSignal(this.store.select(selectAllTodos), {
    initialValue: [] as Todo[],
  });
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

  /** Applies the injected TodoFilterStrategy for the given filter id. */
  filterTodos(filter: TodoFilter): Todo[] {
    return this.filterStrategies[filter].apply(this.todos());
  }

  load(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  add(task: string): void {
    this.store.dispatch(TodoActions.addTodo({ task }));
  }

  update(todo: Partial<Todo> & { id: string }): void {
    this.store.dispatch(TodoActions.updateTodo({ todo }));
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
