import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TodoFilter } from '@anular-ngrx/todos-data-access';
import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';

export type TodoListFilter = TodoFilter;

/** Per-item edit lifecycle (phase 4.4.2). */
export type TodoEditStatus = 'viewing' | 'editing' | 'saving';

export interface TodoListUiState {
  filter: TodoListFilter;
  editStatus: TodoEditStatus;
  editingId: string | null;
  selectedTag: string | null;
  /** Immediate search input (debounce applied in the list page). */
  searchQuery: string;
}

export const TodoListUiStore = signalStore(
  withState<TodoListUiState>({
    filter: 'all',
    editStatus: 'viewing',
    editingId: null,
    selectedTag: null,
    searchQuery: '',
  }),
  withMethods((store) => ({
    setFilter(filter: TodoListFilter) {
      patchState(store, { filter });
    },
    setTag(tag: string | null) {
      patchState(store, { selectedTag: tag });
    },
    setSearchQuery(searchQuery: string) {
      patchState(store, { searchQuery });
    },
    /** viewing → editing */
    startEdit(id: string) {
      patchState(store, { editStatus: 'editing', editingId: id });
    },
    /** editing | saving → viewing */
    cancelEdit() {
      patchState(store, { editStatus: 'viewing', editingId: null });
    },
    /** editing → saving */
    beginSave() {
      if (store.editStatus() !== 'editing' || store.editingId() == null) {
        return;
      }
      patchState(store, { editStatus: 'saving' });
    },
  })),
  withHooks({
    onInit(store) {
      inject(Actions)
        .pipe(
          ofType(
            TodoActions.updateTodoSuccess,
            TodoActions.updateTodoFailure
          ),
          takeUntilDestroyed()
        )
        .subscribe((action) => {
          if (store.editStatus() !== 'saving') {
            return;
          }

          if (action.type === TodoActions.updateTodoSuccess.type) {
            patchState(store, { editStatus: 'viewing', editingId: null });
          } else {
            patchState(store, { editStatus: 'editing' });
          }
        });
    },
  })
);
