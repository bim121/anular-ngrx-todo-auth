import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type TodoListFilter = 'all' | 'active' | 'done';

export interface TodoListUiState {
  filter: TodoListFilter;
  editingId: string | null;
}

export const TodoListUiStore = signalStore(
  withState<TodoListUiState>({ filter: 'all', editingId: null }),
  withMethods((store) => ({
    setFilter(filter: TodoListFilter) {
      patchState(store, { filter });
    },
    startEdit(id: string) {
      patchState(store, { editingId: id });
    },
    cancelEdit() {
      patchState(store, { editingId: null });
    },
  }))
);
