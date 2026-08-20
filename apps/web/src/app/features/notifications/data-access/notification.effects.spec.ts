import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { NotificationEffects } from './notification.effects';
import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';
import { Todo } from '@anular-ngrx/todos-data-access';
import * as NotificationActions from './notification.actions';

describe('NotificationEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: NotificationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);

    TestBed.configureTestingModule({
      providers: [NotificationEffects, provideMockActions(() => actions$ as Observable<unknown>)],
    });

    effects = TestBed.inject(NotificationEffects);
  });

  it('todoAssignedOnAdd$: dispatches todoAssigned on addTodoSuccess', async () => {
    const todo: Todo = {
      id: 't1',
      userId: 'u1',
      task: 'New task',
      completed: false,
      status: 'todo',
      tags: [] as string[],
      priority: 'medium',
    };

    const promise = new Promise<ReturnType<typeof NotificationActions.todoAssigned>>((resolve) => {
      effects.todoAssignedOnAdd$.subscribe((action) => resolve(action));
    });

    actions$.next(TodoActions.addTodoSuccess({ todo }));
    const action = await promise;

    expect(action.type).toBe(NotificationActions.todoAssigned.type);
    expect(action.notification.message).toBe('Task assigned: New task');
    expect(action.notification.todoId).toBe('t1');
    expect(action.notification.read).toBe(false);
  });
});
