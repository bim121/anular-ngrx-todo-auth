import { inject, Injectable, TransferState } from '@angular/core';
import { Router } from '@angular/router';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  defer,
  exhaustMap,
  filter,
  map,
  of,
  retry,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { routerNavigatedAction } from '@ngrx/router-store';
import { EffectsLifecycleService } from '@anular-ngrx/shared-ui/effects-lifecycle.service';
import { ToastService } from '@anular-ngrx/shared-ui/toast/toast.service';
import * as AuthSelectors from '@anular-ngrx/auth-data-access/auth.selectors';
import * as TodoSelectors from './todo.selectors';
import { TodoRepository } from './todo.repository';
import * as TodoActions from './todo.actions';
import { Todo } from './todo.model';
import { consumeTransferredTodos } from './todos-transfer.state';
import {
  getLeafRouteResolvedTodos,
  isTodoDataRoute,
} from './todos-route.util';

/**
 * Retries for read-only API calls (loadTodos). Mutations must not retry.
 * `count: 2` = 2 retries after the first failure (3 HTTP attempts total).
 */
const LOAD_RETRY = { count: 2, delay: 1000 } as const;

@Injectable()
export class TodoEffects {
  private readonly actions$ = inject(Actions);
  private readonly todos = inject(TodoRepository);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly transferState = inject(TransferState);
  private readonly lifecycle = inject(EffectsLifecycleService);
  private readonly toast = inject(ToastService);

  /** Seed store from route resolver (SSR TransferState path) — skip HTTP (Phase 7.2.3). */
  hydrateTodosFromRoute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      map(() => getLeafRouteResolvedTodos(this.router.routerState.snapshot.root)),
      filter((todos): todos is Todo[] => todos !== null),
      map((todos) => TodoActions.loadTodosSuccess({ todos }))
    )
  );

  loadTodosOnNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      filter(([action, userId]) => {
        if (userId == null) {
          return false;
        }

        const url = action.payload.routerState.url;
        if (!isTodoDataRoute(url)) {
          return false;
        }

        const resolved = getLeafRouteResolvedTodos(
          this.router.routerState.snapshot.root
        );
        return resolved === null;
      }),
      map(() => TodoActions.loadTodos())
    )
  );

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      filter(([, userId]) => userId != null),
      exhaustMap(([, userId]) => {
        const transferred = consumeTransferredTodos(this.transferState);
        if (transferred) {
          return of(TodoActions.loadTodosSuccess({ todos: transferred }));
        }

        return defer(() => this.todos.getAll(userId!)).pipe(
          takeUntil(this.lifecycle.cancelPendingRequests),
          retry(LOAD_RETRY),
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((error) => of(TodoActions.loadTodosFailure({ error })))
        );
      })
    )
  );

  addTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.addTodo),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      concatMap(([{ task }, userId]) => {
        if (userId == null) {
          return of(
            TodoActions.addTodoFailure({
              error: new Error('Not logged in'),
            })
          );
        }

        return this.todos.create({ task, userId }).pipe(
          map((todo) => TodoActions.addTodoSuccess({ todo })),
          catchError((error) => of(TodoActions.addTodoFailure({ error })))
        );
      })
    )
  );

  toggleTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.toggleTodo),
      concatLatestFrom(() => [
        this.store.select(AuthSelectors.selectUserId),
        this.store.select(TodoSelectors.selectTodoEntities),
      ]),
      switchMap(([{ id }, userId, entities]) => {
        const todo = entities[id];
        const previousCompleted = todo ? !todo.completed : false;

        if (userId == null || !todo) {
          return of(
            TodoActions.toggleTodoFailure({
              id,
              previousCompleted,
              error: new Error('Not logged in'),
            })
          );
        }

        return this.todos
          .update(
            {
              id,
              completed: todo.completed,
              status: todo.status,
              completedAt: todo.completedAt ?? null,
            },
            userId
          )
          .pipe(
            map((updated) => TodoActions.toggleTodoSuccess({ todo: updated })),
            catchError((error) =>
              of(
                TodoActions.toggleTodoFailure({
                  id,
                  previousCompleted,
                  error,
                })
              )
            )
          );
      })
    )
  );

  toggleTodoFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TodoActions.toggleTodoFailure),
        tap(({ error }) => {
          const message =
            error instanceof Error
              ? `${error.message} — changes reverted`
              : 'Could not update task — changes reverted';
          this.toast.error(message);
        })
      ),
    { dispatch: false }
  );

  updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodo),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      switchMap(([{ todo }, userId]) => {
        if (userId == null) {
          return of(
            TodoActions.updateTodoFailure({
              error: new Error('Not logged in'),
            })
          );
        }

        return this.todos.update(todo, userId).pipe(
          map((updated) => TodoActions.updateTodoSuccess({ todo: updated })),
          catchError((error) => of(TodoActions.updateTodoFailure({ error })))
        );
      })
    )
  );

  deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodo),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      switchMap(([{ todoId }, userId]) => {
        if (userId == null) {
          return of(
            TodoActions.deleteTodoFailure({
              error: new Error('Not logged in'),
            })
          );
        }

        return this.todos.delete(todoId, userId).pipe(
          map(() => TodoActions.deleteTodoSuccess({ todoId })),
          catchError((error) => of(TodoActions.deleteTodoFailure({ error })))
        );
      })
    )
  );
}
