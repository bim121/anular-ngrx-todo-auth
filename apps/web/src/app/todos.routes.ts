import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import {
  CommentEffects,
  commentsFeatureKey,
  commentsReducer,
  provideCommentRepository,
  provideTodoFilterStrategies,
  provideTodoRepository,
  TodoEffects,
  todosFeatureKey,
  todosReducer,
} from '@anular-ngrx/todos-data-access';
import { authGuard } from './core/guards/auth.guard';
import { provideRealtimeService } from './core/realtime/realtime.providers';
import { RealtimeEffects } from './core/realtime/realtime.effects';
import { RoutePageData } from './core/routing/route-page-data.model';
import {
  notificationsFeatureKey,
  notificationsReducer,
} from './features/notifications/data-access/notification.reducer';
import { NotificationEffects } from './features/notifications/data-access/notification.effects';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(todosFeatureKey, todosReducer),
      provideState(commentsFeatureKey, commentsReducer),
      provideState(notificationsFeatureKey, notificationsReducer),
      provideTodoRepository(),
      provideCommentRepository(),
      provideTodoFilterStrategies(),
      provideRealtimeService(),
      provideEffects(
        TodoEffects,
        CommentEffects,
        NotificationEffects,
        RealtimeEffects
      ),
    ],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'todos',
        loadComponent: () =>
          import('@anular-ngrx/todos-feature-list').then(
            (m) => m.TodoListPageComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'My Todos',
          breadcrumb: 'Todos',
        } satisfies RoutePageData,
      },
      {
        path: 'kanban',
        loadComponent: () =>
          import('@anular-ngrx/todos-feature-list').then(
            (m) => m.KanbanBoardComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'Kanban',
          breadcrumb: 'Kanban',
        } satisfies RoutePageData,
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('@anular-ngrx/todos-feature-list').then(
            (m) => m.CalendarViewComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'Calendar',
          breadcrumb: 'Calendar',
        } satisfies RoutePageData,
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('@anular-ngrx/auth-feature-login').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [authGuard],
        data: {
          title: 'My Profile',
          breadcrumb: 'Profile',
        } satisfies RoutePageData,
      },
    ],
  },
];
