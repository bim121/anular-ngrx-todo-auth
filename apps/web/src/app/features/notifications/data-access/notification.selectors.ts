import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notification.model';
import { notificationsFeatureKey, selectAll } from './notification.reducer';

export const selectNotificationsState =
  createFeatureSelector<NotificationsState>(notificationsFeatureKey);

export const selectAllNotifications = createSelector(selectNotificationsState, selectAll);

export const selectUnreadNotificationsCount = createSelector(
  selectAllNotifications,
  (notifications) => notifications.filter((n) => !n.read).length,
);
