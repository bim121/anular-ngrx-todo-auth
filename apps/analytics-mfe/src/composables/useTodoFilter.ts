import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { TodoFilter } from '@/features/todos/apply-filter';
import { useTodosStore } from '@/stores/todos';

export function useTodoFilter() {
  const store = useTodosStore();
  const { allTodos } = storeToRefs(store);
  const filter = ref<TodoFilter>('all');

  const filteredTodos = computed(() => store.filteredTodos(filter.value));

  return {
    filter,
    allTodos,
    filteredTodos,
  };
}
