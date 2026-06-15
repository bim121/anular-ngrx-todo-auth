export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
}

export type TodoFilter = 'all' | 'active' | 'done';

export function applyFilter(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'done':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}
