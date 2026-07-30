import type { EntityState } from '@ngrx/entity';

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoFilter = 'all' | 'active' | 'done';

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
  /** ISO timestamp when marked completed (for weekly stats). */
  completedAt?: string | null;
  tags: string[];
  priority: TodoPriority;
  parentId?: string;
}

/** Payload to create a todo — repository assigns id / defaults. */
export interface CreateTodoDto {
  task: string;
  userId: string;
  parentId?: string;
  tags?: string[];
  priority?: TodoPriority;
}

export interface TodoTreeNode extends Todo {
  children: TodoTreeNode[];
}

export interface TodosState extends EntityState<Todo> {
  loading: boolean;
  error: string | null;
  /** Todo ids with in-flight toggle HTTP requests (checkbox disabled). */
  pendingToggleIds: string[];
}

export const DEFAULT_TODO_PRIORITY: TodoPriority = 'medium';

export function normalizeTodo(todo: Todo): Todo {
  return {
    ...todo,
    tags: todo.tags ?? [],
    priority: todo.priority ?? DEFAULT_TODO_PRIORITY,
  };
}
