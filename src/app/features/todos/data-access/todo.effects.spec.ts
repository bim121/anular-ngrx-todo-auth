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
import { TodoRepository } from './todo.repository';
import { Store } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import * as TodoActions from './todo.actions';
import { Todo } from './todo.model';

describe('TodoEffects loadTodos$', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TodoEffects;
  let getAllMock: ReturnType<typeof vi.fn>;
  let lifecycle: EffectsLifecycleService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    getAllMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        { provide: TodoRepository, useValue: { getAll: getAllMock } },
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

  it('passes userId from store to getAll', async () => {
    getAllMock.mockReturnValue(
      of([{ id: '1', userId: 'user-1', task: 'A', completed: false, tags: [], priority: 'medium' as const }])
    );

    actions$.next(TodoActions.loadTodos());
    await firstValueFrom(effects.loadTodos$);

    expect(getAllMock).toHaveBeenCalledWith('user-1');
  });

  it('retries getAll twice then dispatches loadTodosSuccess', async () => {
    getAllMock
      .mockReturnValueOnce(throwError(() => new Error('network')))
      .mockReturnValueOnce(throwError(() => new Error('network')))
      .mockReturnValueOnce(
        of([{ id: '1', userId: 'user-1', task: 'A', completed: false, tags: [], priority: 'medium' as const }])
      );

    actions$.next(TodoActions.loadTodos());
    const action = await firstValueFrom(effects.loadTodos$);

    expect(getAllMock).toHaveBeenCalledTimes(3);
    expect(getAllMock).toHaveBeenCalledWith('user-1');
    expect(action.type).toBe(TodoActions.loadTodosSuccess.type);
  });

  it('dispatches loadTodosFailure after retries exhausted', async () => {
    getAllMock.mockReturnValue(throwError(() => new Error('down')));

    actions$.next(TodoActions.loadTodos());
    const action = await firstValueFrom(effects.loadTodos$);

    expect(getAllMock).toHaveBeenCalledTimes(3);
    expect(getAllMock).toHaveBeenCalledWith('user-1');
    expect(action.type).toBe(TodoActions.loadTodosFailure.type);
  });

  it('does not call getAll when userId is missing', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        { provide: TodoRepository, useValue: { getAll: getAllMock } },
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
    expect(getAllMock).not.toHaveBeenCalled();
  });

  it('does not dispatch loadTodosSuccess when load is cancelled on logout', async () => {
    const pendingTodos$ = new Subject<Todo[]>();
    getAllMock.mockReturnValue(pendingTodos$.asObservable());

    let emitted: unknown;
    const sub = effects.loadTodos$.subscribe((action) => {
      emitted = action;
    });

    actions$.next(TodoActions.loadTodos());
    lifecycle.notifyCancelPendingRequests();
    pendingTodos$.next([
      { id: '1', userId: 'user-1', task: 'A', completed: false, tags: [], priority: 'medium' as const },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getAllMock).toHaveBeenCalledWith('user-1');
    expect(emitted).toBeUndefined();
    sub.unsubscribe();
  });
});

describe('TodoEffects loadTodosOnNavigation$', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TodoEffects;

  function setup(userId: string | null): void {
    actions$ = new ReplaySubject(1);

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$ as Observable<unknown>),
        { provide: TodoRepository, useValue: {} },
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) =>
              selector === selectUserId ? of(userId) : of(undefined),
          },
        },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
      ],
    });

    effects = TestBed.inject(TodoEffects);
  }

  it('dispatches loadTodos when navigated to /todos and user is authenticated', async () => {
    setup('user-1');

    actions$.next(
      routerNavigatedAction({
        payload: {
          routerState: {
            url: '/todos',
            params: {},
            queryParams: {},
          } as never,
          event: { id: 1 } as never,
        },
      })
    );

    const action = await firstValueFrom(effects.loadTodosOnNavigation$);
    expect(action).toEqual(TodoActions.loadTodos());
  });

  it('does not dispatch when user is not authenticated', async () => {
    setup(null);

    let emitted = false;
    effects.loadTodosOnNavigation$.subscribe(() => {
      emitted = true;
    });

    actions$.next(
      routerNavigatedAction({
        payload: {
          routerState: {
            url: '/todos',
            params: {},
            queryParams: {},
          } as never,
          event: { id: 1 } as never,
        },
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(emitted).toBe(false);
  });

  it('does not dispatch when navigation target is not todos', async () => {
    setup('user-1');

    let emitted = false;
    effects.loadTodosOnNavigation$.subscribe(() => {
      emitted = true;
    });

    actions$.next(
      routerNavigatedAction({
        payload: {
          routerState: {
            url: '/profile',
            params: {},
            queryParams: {},
          } as never,
          event: { id: 1 } as never,
        },
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(emitted).toBe(false);
  });
});

describe('TodoEffects toggleTodo$ (marble)', () => {
  const todo = {
    id: '1',
    userId: 'user-1',
    task: 'A',
    completed: true,
    tags: [] as string[],
    priority: 'medium' as const,
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
            provide: TodoRepository,
            useValue: { update: updateTodoMock },
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
          provide: TodoRepository,
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

describe('TodoEffects marbles', () => {
  const todo = {
    id: '1',
    userId: 'user-1',
    task: 'A',
    completed: false,
    tags: [] as string[],
    priority: 'medium' as const,
  };

  function runTodoMarble(config: {
    actionsMarble: string;
    actionsValues: Record<string, unknown>;
    effectKey: keyof TodoEffects;
    expectedMarble: string;
    expectedValues?: Record<string, unknown>;
    todoRepository: Record<string, ReturnType<typeof vi.fn>>;
    userId?: string | null;
    entities?: Record<string, typeof todo>;
  }): void {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const actions$ = hot(config.actionsMarble, config.actionsValues);
      const userId = config.userId === undefined ? 'user-1' : config.userId;

      TestBed.configureTestingModule({
        providers: [
          TodoEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: TodoRepository, useValue: config.todoRepository },
          {
            provide: Store,
            useValue: {
              select: (selector: unknown) => {
                if (selector === selectUserId) {
                  return of(userId);
                }
                if (selector === selectTodoEntities) {
                  return of(config.entities ?? { [todo.id]: todo });
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
      expectObservable(effects[config.effectKey] as Observable<unknown>).toBe(
        config.expectedMarble,
        config.expectedValues ?? {}
      );
    });
  }

  it('loadTodos$: dispatches loadTodosSuccess', () => {
    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: { a: TodoActions.loadTodos() },
      effectKey: 'loadTodos$',
      expectedMarble: '-b',
      expectedValues: {
        b: TodoActions.loadTodosSuccess({ todos: [todo] }),
      },
      todoRepository: {
        getAll: vi.fn(() => of([todo])),
      },
    });
  });

  it('loadTodosOnNavigation$: dispatches loadTodos', () => {
    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: {
        a: routerNavigatedAction({
          payload: {
            routerState: { url: '/todos', params: {}, queryParams: {} } as never,
            event: { id: 1 } as never,
          },
        }),
      },
      effectKey: 'loadTodosOnNavigation$',
      expectedMarble: '-b',
      expectedValues: { b: TodoActions.loadTodos() },
      todoRepository: {},
    });
  });

  it('addTodo$: dispatches addTodoSuccess', () => {
    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: { a: TodoActions.addTodo({ task: 'New task' }) },
      effectKey: 'addTodo$',
      expectedMarble: '-b',
      expectedValues: {
        b: TodoActions.addTodoSuccess({ todo }),
      },
      todoRepository: {
        create: vi.fn(() => of(todo)),
      },
    });
  });

  it('addTodo$: dispatches addTodoFailure when not logged in', () => {
    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: { a: TodoActions.addTodo({ task: 'New task' }) },
      effectKey: 'addTodo$',
      expectedMarble: '-b',
      expectedValues: {
        b: TodoActions.addTodoFailure({
          error: new Error('Not logged in'),
        }),
      },
      todoRepository: {},
      userId: null,
    });
  });

  it('updateTodo$: dispatches updateTodoSuccess', () => {
    const updated = { ...todo, task: 'Updated' };

    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: { a: TodoActions.updateTodo({ todo: updated }) },
      effectKey: 'updateTodo$',
      expectedMarble: '-b',
      expectedValues: {
        b: TodoActions.updateTodoSuccess({ todo: updated }),
      },
      todoRepository: {
        update: vi.fn(() => of(updated)),
      },
    });
  });

  it('deleteTodo$: dispatches deleteTodoSuccess', () => {
    runTodoMarble({
      actionsMarble: '-a',
      actionsValues: { a: TodoActions.deleteTodo({ todoId: todo.id }) },
      effectKey: 'deleteTodo$',
      expectedMarble: '-b',
      expectedValues: {
        b: TodoActions.deleteTodoSuccess({ todoId: todo.id }),
      },
      todoRepository: {
        delete: vi.fn(() => of(undefined)),
      },
    });
  });

  it('toggleTodoFailureToast$: shows toast (non-dispatching)', () => {
    const toastError = vi.fn();
    const action = TodoActions.toggleTodoFailure({
      id: todo.id,
      previousCompleted: false,
      error: new Error('network'),
    });
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    testScheduler.run(({ hot, expectObservable }) => {
      const actions$ = hot('-a', { a: action });

      TestBed.configureTestingModule({
        providers: [
          TodoEffects,
          provideMockActions(() => actions$ as Observable<unknown>),
          { provide: TodoRepository, useValue: {} },
          { provide: Store, useValue: { select: () => of(undefined) } },
          {
            provide: ToastService,
            useValue: { success: vi.fn(), error: toastError },
          },
        ],
      });

      const effects = TestBed.inject(TodoEffects);
      expectObservable(effects.toggleTodoFailureToast$).toBe('-a', { a: action });
    });

    expect(toastError).toHaveBeenCalledWith('network — changes reverted');
  });
});
