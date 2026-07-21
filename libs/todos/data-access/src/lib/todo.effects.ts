import { inject, Injectable } from '@angular/core';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  defer,
  filter,
  map,
  of,
  retry,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { routerNavigatedAction } from '@ngrx/router-store';
import { EffectsLifecycleService } from '@anular-ngrx/shared-ui';
import { ToastService } from '@anular-ngrx/shared-ui';
import * as AuthSelectors from '@anular-ngrx/auth-data-access/auth.selectors';
import * as TodoSelectors from './todo.selectors';
import { TodoRepository } from './todo.repository';
import * as TodoActions from './todo.actions';

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
  private readonly lifecycle = inject(EffectsLifecycleService);
  private readonly toast = inject(ToastService);

  loadTodosOnNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      filter(
        ([action, userId]) =>
          userId != null && action.payload.routerState.url.includes('/todos')
      ),
      map(() => TodoActions.loadTodos())
    )
  );

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      filter(([, userId]) => userId != null),
      switchMap(([, userId]) =>
        defer(() => this.todos.getAll(userId!)).pipe(
          takeUntil(this.lifecycle.cancelPendingRequests),
          retry(LOAD_RETRY),
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((error) => of(TodoActions.loadTodosFailure({ error })))
        )
      )
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
          .update({ id, completed: todo.completed }, userId)
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
