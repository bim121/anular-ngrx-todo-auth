import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserId } from '@anular-ngrx/auth-data-access';
import {
  Todo,
  TodoRepository,
  TODOS_TRANSFER_STATE_KEY,
} from '@anular-ngrx/todos-data-access';
import { firstValueFrom, of, switchMap, take, tap } from 'rxjs';
import { SsrSessionService } from '@app/core/ssr/ssr-session.service';

/** Prefetch todos on SSR and reuse via TransferState after hydration (Phase 7.2.2). */
export const todosResolver: ResolveFn<Todo[]> = () => {
  const repo = inject(TodoRepository);
  const transferState = inject(TransferState);
  const store = inject(Store);
  const platformId = inject(PLATFORM_ID);
  const session = inject(SsrSessionService);

  if (transferState.hasKey(TODOS_TRANSFER_STATE_KEY)) {
    return transferState.get(TODOS_TRANSFER_STATE_KEY, []);
  }

  return firstValueFrom(
    store.select(selectUserId).pipe(
      take(1),
      switchMap((storeUserId) => {
        const userId = storeUserId ?? session.getUserIdFromRequest();
        if (!userId) {
          return of([]);
        }

        return repo.getAll(userId).pipe(
          tap((todos) => {
            if (isPlatformServer(platformId)) {
              transferState.set(TODOS_TRANSFER_STATE_KEY, todos);
            }
          })
        );
      })
    )
  );
};
