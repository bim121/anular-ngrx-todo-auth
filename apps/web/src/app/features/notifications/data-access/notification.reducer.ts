import { createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Notification, NotificationsState } from './notification.model';
import * as NotificationActions from './notification.actions';

export const notificationsFeatureKey = 'notifications';

export const notificationsAdapter = createEntityAdapter<Notification>({
  selectId: (notification) => notification.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

export const initialNotificationsState: NotificationsState = notificationsAdapter.getInitialState();

export const notificationsReducer = createReducer(
  initialNotificationsState,

  on(NotificationActions.todoAssigned, (state, { notification }) =>
    notificationsAdapter.addOne(notification, state),
  ),

  on(NotificationActions.markNotificationRead, (state, { id }) =>
    notificationsAdapter.updateOne({ id, changes: { read: true } }, state),
  ),
);

export const { selectAll, selectEntities, selectTotal } = notificationsAdapter.getSelectors();
