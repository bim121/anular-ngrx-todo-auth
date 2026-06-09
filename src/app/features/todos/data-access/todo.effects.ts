import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { TodoService } from "./todo.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as AuthSelectors from '@app/features/auth/data-access/auth.selectors';
import {
  catchError,
  defer,
  exhaustMap,
  filter,
  map,
  of,
  retry,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import * as TodoActions from './todo.actions';

/**
 * Retries for read-only API calls (loadTodos). Mutations must not retry.
 * `count: 2` = 2 retries after the first failure (3 HTTP attempts total).
 */
const LOAD_RETRY = { count: 2, delay: 1000 } as const;

@Injectable()
export class TodoEffects {
    private actions$ = inject(Actions);
    private todoService = inject(TodoService);
    private store = inject(Store);

    loadTodos$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.loadTodos),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            filter(([, userId]) => userId != null),
            exhaustMap(([, userId]) =>
                defer(() => this.todoService.getTodos(userId!)).pipe(
                    retry(LOAD_RETRY),
                    map((todos) => TodoActions.loadTodosSuccess({ todos })),
                    catchError((error) =>
                        of(TodoActions.loadTodosFailure({ error }))
                    )
                )
            )
        )
    );

    addTodo$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.addTodo),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            switchMap(([{ task }, userId]) => {
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
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
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
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
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