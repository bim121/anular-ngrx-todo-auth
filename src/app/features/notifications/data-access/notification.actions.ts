import { createAction, props } from '@ngrx/store';
import { Notification } from './notification.model';

export const todoAssigned = createAction(
  '[Notifications] Todo Assigned',
  props<{ notification: Notification }>()
);

export const markNotificationRead = createAction(
  '[Notifications] Mark Read',
  props<{ id: string }>()
);
