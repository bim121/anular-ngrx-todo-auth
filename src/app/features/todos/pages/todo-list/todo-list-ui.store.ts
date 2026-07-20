import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TodoFilter } from '@app/features/todos/data-access/todo.model';

export type TodoListFilter = TodoFilter;

export interface TodoListUiState {
  filter: TodoListFilter;
  editingId: string | null;
  selectedTag: string | null;
}

export const TodoListUiStore = signalStore(
  withState<TodoListUiState>({
    filter: 'all',
    editingId: null,
    selectedTag: null,
  }),
  withMethods((store) => ({
    setFilter(filter: TodoListFilter) {
      patchState(store, { filter });
    },
    setTag(tag: string | null) {
      patchState(store, { selectedTag: tag });
    },
    startEdit(id: string) {
      patchState(store, { editingId: id });
    },
    cancelEdit() {
      patchState(store, { editingId: null });
    },
  }))
);
