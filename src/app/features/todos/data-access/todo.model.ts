import type { EntityState } from '@ngrx/entity';

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
}

export interface TodosState extends EntityState<Todo> {
  loading: boolean;
  error: string | null;
}
