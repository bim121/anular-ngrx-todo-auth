import type { EntityState } from '@ngrx/entity';

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoFilter = 'all' | 'active' | 'done';

/** Kanban columns (PF-3.3). Kept in sync with `completed`. */
export type TodoStatus = 'todo' | 'in-progress' | 'done';

export const TODO_STATUSES: readonly TodoStatus[] = [
  'todo',
  'in-progress',
  'done',
] as const;

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  /** Kanban column; defaults from `completed` when missing (legacy rows). */
  status: TodoStatus;
  createdAt?: string;
  /** ISO timestamp when marked completed (for weekly stats). */
  completedAt?: string | null;
  /** ISO date `YYYY-MM-DD` for calendar (PF-3.4). */
  dueDate?: string | null;
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
  status?: TodoStatus;
  dueDate?: string | null;
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
export const DEFAULT_TODO_STATUS: TodoStatus = 'todo';

export function statusFromCompleted(completed: boolean): TodoStatus {
  return completed ? 'done' : 'todo';
}

export function completedFromStatus(status: TodoStatus): boolean {
  return status === 'done';
}

/** ISO date string for `days` after today (UTC calendar day). */
export function defaultDueDate(daysFromNow = 7): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function normalizeTodo(
  todo: Omit<Todo, 'status' | 'tags' | 'priority' | 'completed' | 'dueDate'> &
    Partial<Pick<Todo, 'status' | 'tags' | 'priority' | 'completed' | 'dueDate'>>
): Todo {
  const tags = todo.tags ?? [];
  const priority = todo.priority ?? DEFAULT_TODO_PRIORITY;
  const status = todo.status ?? statusFromCompleted(!!todo.completed);
  const completed =
    todo.status != null ? completedFromStatus(status) : !!todo.completed;

  return {
    ...todo,
    tags,
    priority,
    status,
    completed,
    dueDate: todo.dueDate ?? null,
  };
}

/** Patch fields when moving a card between Kanban columns. */
export function kanbanStatusPatch(status: TodoStatus): Partial<Todo> {
  const completed = completedFromStatus(status);
  return {
    status,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  };
}
