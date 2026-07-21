import {
  initialNotificationsState,
  notificationsAdapter,
  notificationsReducer,
} from './notification.reducer';
import * as NotificationActions from './notification.actions';

describe('notificationsReducer', () => {
  const notification = {
    id: 'n1',
    message: 'Task assigned: Test',
    read: false,
    createdAt: '2026-06-01T00:00:00.000Z',
    todoId: 't1',
  };

  it('adds notification on todoAssigned', () => {
    const state = notificationsReducer(
      initialNotificationsState,
      NotificationActions.todoAssigned({ notification }),
    );

    expect(notificationsAdapter.getSelectors().selectAll(state)).toEqual([notification]);
  });

  it('marks notification as read', () => {
    const withNotification = notificationsReducer(
      initialNotificationsState,
      NotificationActions.todoAssigned({ notification }),
    );

    const state = notificationsReducer(
      withNotification,
      NotificationActions.markNotificationRead({ id: notification.id }),
    );

    expect(notificationsAdapter.getSelectors().selectAll(state)[0].read).toBe(true);
  });
});
