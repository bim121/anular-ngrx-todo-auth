import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { TodoEffects } from './todo.effects';
import { TodoService } from './todo.service';
import { Store } from '@ngrx/store';
import * as TodoActions from './todo.actions';
import { selectUserId } from '@app/features/auth/data-access/auth.selectors';

describe('TodoEffects loadTodos$', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TodoEffects;
  let getTodosMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    getTodosMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        { provide: TodoService, useValue: { getTodos: getTodosMock } },
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) =>
              selector === selectUserId ? of('user-1') : of(undefined),
          },
        },
      ],
    });

    effects = TestBed.inject(TodoEffects);
  });

  it('passes userId from store to getTodos', async () => {
    getTodosMock.mockReturnValue(
      of([{ id: '1', userId: 'user-1', task: 'A', completed: false }])
    );

    actions$.next(TodoActions.loadTodos());
    await firstValueFrom(effects.loadTodos$);

    expect(getTodosMock).toHaveBeenCalledWith('user-1');
  });

  it('retries getTodos twice then dispatches loadTodosSuccess', async () => {
    getTodosMock
      .mockReturnValueOnce(throwError(() => new Error('network')))
      .mockReturnValueOnce(throwError(() => new Error('network')))
      .mockReturnValueOnce(
        of([{ id: '1', userId: 'user-1', task: 'A', completed: false }])
      );

    actions$.next(TodoActions.loadTodos());
    const action = await firstValueFrom(effects.loadTodos$);

    expect(getTodosMock).toHaveBeenCalledTimes(3);
    expect(getTodosMock).toHaveBeenCalledWith('user-1');
    expect(action.type).toBe(TodoActions.loadTodosSuccess.type);
  });

  it('dispatches loadTodosFailure after retries exhausted', async () => {
    getTodosMock.mockReturnValue(throwError(() => new Error('down')));

    actions$.next(TodoActions.loadTodos());
    const action = await firstValueFrom(effects.loadTodos$);

    expect(getTodosMock).toHaveBeenCalledTimes(3);
    expect(getTodosMock).toHaveBeenCalledWith('user-1');
    expect(action.type).toBe(TodoActions.loadTodosFailure.type);
  });

  it('does not call getTodos when userId is missing', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        { provide: TodoService, useValue: { getTodos: getTodosMock } },
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) =>
              selector === selectUserId ? of(null) : of(undefined),
          },
        },
      ],
    });
    const effectsWithoutUser = TestBed.inject(TodoEffects);

    let emitted = false;
    effectsWithoutUser.loadTodos$.subscribe(() => {
      emitted = true;
    });

    actions$.next(TodoActions.loadTodos());
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(emitted).toBe(false);
    expect(getTodosMock).not.toHaveBeenCalled();
  });
});
