import type { EntityState } from '@ngrx/entity';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  todoId?: string;
}

export type NotificationsState = EntityState<Notification>;
