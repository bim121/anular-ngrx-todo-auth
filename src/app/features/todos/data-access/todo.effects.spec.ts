import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  firstValueFrom,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { EffectsLifecycleService } from '@app/core/effects/effects-lifecycle.service';
import { ToastService } from '@app/shared/ui/toast/toast.service';
import { selectUserId } from '@app/features/auth/data-access/auth.selectors';
import { selectTodoEntities } from '@app/features/todos/data-access/todo.selectors';
import { TodoEffects } from './todo.effects';
import { TodoService } from './todo.service';
import { Store } from '@ngrx/store';
import * as TodoActions from './todo.actions';

describe('TodoEffects loadTodos$', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TodoEffects;
  let getTodosMock: ReturnType<typeof vi.fn>;
  let lifecycle: EffectsLifecycleService;

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
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
      ],
    });

    effects = TestBed.inject(TodoEffects);
    lifecycle = TestBed.inject(EffectsLifecycleService);
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
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
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

  it('does not dispatch loadTodosSuccess when load is cancelled on logout', async () => {
    const pendingTodos$ = new Subject<
      { id: string; userId: string; task: string; completed: boolean }[]
    >();
    getTodosMock.mockReturnValue(pendingTodos$.asObservable());

    let emitted: unknown;
    const sub = effects.loadTodos$.subscribe((action) => {
      emitted = action;
    });

    actions$.next(TodoActions.loadTodos());
    lifecycle.notifyCancelPendingRequests();
    pendingTodos$.next([
      { id: '1', userId: 'user-1', task: 'A', completed: false },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getTodosMock).toHaveBeenCalledWith('user-1');
    expect(emitted).toBeUndefined();
    sub.unsubscribe();
  });
});

describe('TodoEffects toggleTodo$ (marble)', () => {
  const todo = {
    id: '1',
    userId: 'user-1',
    task: 'A',
    completed: true,
  };

  function runToggleMarble(
    updateTodoReturn: Observable<typeof todo>,
    expectedMarble: string,
    expectedValue: Record<string, unknown>
  ): void {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const actions$ = hot('-a', {
        a: TodoActions.toggleTodo({ id: todo.id }),
      });
      const updateTodoMock = vi.fn(() => updateTodoReturn);

      TestBed.configureTestingModule({
        providers: [
          TodoEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          {
            provide: TodoService,
            useValue: { updateTodo: updateTodoMock },
          },
          {
            provide: Store,
            useValue: {
              select: (selector: unknown) => {
                if (selector === selectUserId) {
                  return of('user-1');
                }
                if (selector === selectTodoEntities) {
                  return of({ [todo.id]: todo });
                }
                return of(undefined);
              },
            },
          },
          {
            provide: ToastService,
            useValue: { success: vi.fn(), error: vi.fn() },
          },
        ],
      });

      const effects = TestBed.inject(TodoEffects);
      expectObservable(effects.toggleTodo$).toBe(expectedMarble, expectedValue);
    });
  }

  it('success path dispatches toggleTodoSuccess', () => {
    runToggleMarble(
      of({ ...todo, completed: true }),
      '-b',
      {
        b: TodoActions.toggleTodoSuccess({
          todo: { ...todo, completed: true },
        }),
      }
    );
  });

  it('failure path dispatches toggleTodoFailure with rollback payload', () => {
    runToggleMarble(
      throwError(() => new Error('network')),
      '-b',
      {
        b: TodoActions.toggleTodoFailure({
          id: todo.id,
          previousCompleted: false,
          error: new Error('network'),
        }),
      }
    );
  });
});

describe('TodoEffects toggleTodoFailureToast$', () => {
  it('shows toast when toggle rollback happens', async () => {
    const actions$ = new ReplaySubject(1);
    const toastError = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        {
          provide: TodoService,
          useValue: {},
        },
        {
          provide: Store,
          useValue: { select: () => of(undefined) },
        },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: toastError },
        },
      ],
    });

    const effects = TestBed.inject(TodoEffects);
    const sub = effects.toggleTodoFailureToast$.subscribe();

    actions$.next(
      TodoActions.toggleTodoFailure({
        id: '1',
        previousCompleted: false,
        error: new Error('network'),
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(toastError).toHaveBeenCalledWith('network — changes reverted');
    sub.unsubscribe();
  });
});
