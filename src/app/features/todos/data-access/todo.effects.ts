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
} from 'rxjs';
import * as AuthSelectors from '@app/features/auth/data-access/auth.selectors';
import { TodoService } from './todo.service';
import * as TodoActions from './todo.actions';

/**
 * Retries for read-only API calls (loadTodos). Mutations must not retry.
 * `count: 2` = 2 retries after the first failure (3 HTTP attempts total).
 */
const LOAD_RETRY = { count: 2, delay: 1000 } as const;

@Injectable()
export class TodoEffects {
  private readonly actions$ = inject(Actions);
  private readonly todoService = inject(TodoService);
  private readonly store = inject(Store);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      concatLatestFrom(() => this.store.select(AuthSelectors.selectUserId)),
      filter(([, userId]) => userId != null),
      switchMap(([, userId]) =>
        defer(() => this.todoService.getTodos(userId!)).pipe(
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

        return this.todoService.addTodo(task, userId).pipe(
          map((todo) => TodoActions.addTodoSuccess({ todo })),
          catchError((error) => of(TodoActions.addTodoFailure({ error })))
        );
      })
    )
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

        return this.todoService.updateTodo(todo, userId).pipe(
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

        return this.todoService.deleteTodo(todoId, userId).pipe(
          map(() => TodoActions.deleteTodoSuccess({ todoId })),
          catchError((error) => of(TodoActions.deleteTodoFailure({ error })))
        );
      })
    )
  );
}
