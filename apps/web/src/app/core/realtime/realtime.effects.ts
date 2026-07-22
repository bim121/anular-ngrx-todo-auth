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
import { ToastService } from '@anular-ngrx/shared-ui';
import { selectIsFeatureEnabled } from '@app/core/config/app-config.selectors';
import { RealtimeService } from './realtime.service';

/**
 * Skeleton for live collaboration:
 * - connect on login when `features.useRealTime`
 * - map `todo.updated` → `applyRemoteTodoUpdate` (store only, no HTTP write-back)
 * - disconnect on logout
 * Full reconnect/backoff + multi-browser sync → Phase 5.
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
        this.store.select(selectIsFeatureEnabled('useRealTime')),
      ]),
      filter(([, userId, enabled]) => !!userId && enabled === true),
      tap(([, userId]) => this.realtime.connect(userId!)),
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

  disconnectOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutUser),
        tap(() => this.realtime.disconnect())
      ),
    { dispatch: false }
  );
}
