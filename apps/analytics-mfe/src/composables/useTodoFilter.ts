import { computed, ref, type Ref } from 'vue';
import { applyFilter, type Todo, type TodoFilter } from '@/features/todos/apply-filter';

export function useTodoFilter(todos: Ref<Todo[]>) {
  const filter = ref<TodoFilter>('all');

  const filteredTodos = computed(() => applyFilter(todos.value, filter.value));

  return {
    filter,
    filteredTodos,
  };
}
