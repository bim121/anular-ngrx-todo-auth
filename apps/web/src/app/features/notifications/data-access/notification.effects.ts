import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs';
import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';
import * as NotificationActions from './notification.actions';

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);

  /** Mock: new todo triggers an in-app notification (PF-7.1). */
  todoAssignedOnAdd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.addTodoSuccess),
      map(({ todo }) =>
        NotificationActions.todoAssigned({
          notification: {
            id: crypto.randomUUID(),
            message: `Task assigned: ${todo.task}`,
            read: false,
            createdAt: new Date().toISOString(),
            todoId: todo.id,
          },
        }),
      ),
    ),
  );
}
