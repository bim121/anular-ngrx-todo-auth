import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import {
  EMPTY,
  filter,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';
import * as AuthSelectors from '@anular-ngrx/auth-data-access/auth.selectors';
import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';
import { ToastService } from '@anular-ngrx/shared-ui/toast/toast.service';
import { selectIsFeatureEnabled } from '@app/core/config/app-config.selectors';
import { RealtimeService } from './realtime.service';

/**
 * Live collaboration (PF-1.1):
 * - connect on login when `features.useRealTime`
 * - map `todo.updated` → `applyRemoteTodoUpdate`
 * - publish local mutations to peers
 * - disconnect on logout (reconnect/backoff lives in WsRealtimeService)
 */
@Injectable()
export class RealtimeEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly realtime = inject(RealtimeService);
  private readonly toast = inject(ToastService);

  connectOnLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      concatLatestFrom(() => [
        this.store.select(AuthSelectors.selectUserId),
        this.store.select(AuthSelectors.selectUser),
        this.store.select(selectIsFeatureEnabled('useRealTime')),
      ]),
      filter(([, userId, , enabled]) => !!userId && enabled === true),
      tap(([, userId, user]) =>
        this.realtime.connect(userId!, user?.name ?? 'You')
      ),
      switchMap(() =>
        this.realtime.events$.pipe(
          takeUntil(this.actions$.pipe(ofType(AuthActions.logoutUser))),
          mergeMap((event) => {
            if (event.type === 'presence') {
              this.toast.success(event.message);
              return EMPTY;
            }

            this.toast.success(`${event.byUserName} edited a task`);
            return [
              TodoActions.applyRemoteTodoUpdate({
                todo: event.todo,
              }),
            ];
          })
        )
      )
    )
  );

  publishLocalMutations$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          TodoActions.updateTodoSuccess,
          TodoActions.toggleTodoSuccess,
          TodoActions.addTodoSuccess
        ),
        concatLatestFrom(() =>
          this.store.select(selectIsFeatureEnabled('useRealTime'))
        ),
        filter(([, enabled]) => enabled === true),
        tap(([action]) => {
          const todo =
            'todo' in action
              ? {
                  id: action.todo.id,
                  task: action.todo.task,
                  completed: action.todo.completed,
                }
              : null;
          if (!todo) return;
          this.realtime.publishTodoUpdate(todo);
        })
      ),
    { dispatch: false }
  );

  disconnectOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutUser),
        tap(() => this.realtime.disconnect())
      ),
    { dispatch: false }
  );
}
