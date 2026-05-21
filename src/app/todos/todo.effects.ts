import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { TodoService } from "./todo.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as AuthSelectors from '../auth/auth.selectors';
import { catchError, exhaustMap, filter, map, of, withLatestFrom } from "rxjs";
import { access } from "fs";
import { loadTodosSuccess, loadTodosFailure } from './todo.actions';
import * as TodoActions from './todo.actions';

@Injectable()
export class TodoEffects {
    private actions$ = inject(Actions);
    private todoService = inject(TodoService);
    private store = inject(Store);

    loadTodos$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.loadTodos),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            filter(([action, userId]) => userId != null),
            exhaustMap(([action, userId]) =>
                this.todoService.getTodos(userId!).pipe(
                    map(todos =>
                        TodoActions.loadTodosSuccess({todos})
                    ),
                    catchError(error => of(TodoActions.loadTodosFailure({error})))
                )
            )
        )
    );

    addTodo$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.addTodo),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            filter(([action, userId]) => userId != null),
            exhaustMap(([action, userId]) =>
                this.todoService.addTodo(action.task, userId!).pipe(
                    map(todo =>
                        TodoActions.addTodoSuccess({todo})
                    ),
                    catchError(error => of(TodoActions.addTodoFailure({error})))
                )
            )
        )
    );

    updateTodo$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.updateTodo),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            filter(([action, userId]) => userId != null),
            exhaustMap(([action, userId]) =>
                this.todoService.updateTodo(action.todo, userId!).pipe(
                    map(todo =>
                        TodoActions.updateTodoSuccess({todo})
                    ),
                    catchError(error => of(TodoActions.updateTodoFailure({error})))
                )
            )
        )
    );

    deleteTodo$ = createEffect(() => 
        this.actions$.pipe(
            ofType(TodoActions.deleteTodo),
            withLatestFrom(this.store.select(AuthSelectors.selectUserId)),
            filter(([action, userId]) => userId != null),
            exhaustMap(([action, userId]) =>
                this.todoService.deleteTodo(action.todoId, userId!).pipe(
                    map(todo =>
                        TodoActions.deleteTodoSuccess({todoId: action.todoId})
                    ),
                    catchError(error => of(TodoActions.deleteTodoFailure({error})))
                )
            )
        )
    );
}