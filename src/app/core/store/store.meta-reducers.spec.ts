import { INIT, MetaReducer } from '@ngrx/store';
import { loginSuccess, logoutUser } from '@app/features/auth/data-access/auth.actions';
import {
  authReducer,
} from '@app/features/auth/data-access/auth.reducer';
import {
  initialTodoState,
  todosReducer,
} from '@app/features/todos/data-access/todo.reducer';
import * as TodoActions from '@app/features/todos/data-access/todo.actions';
import {
  clearStateMetaReducer,
  localStorageSyncReducer,
  metaReducers,
  persistenceReadyMetaReducer,
} from './store.meta-reducers';

function createRootReducer() {
  return (state: Record<string, unknown> | undefined, action: { type: string }) => ({
    auth: authReducer(state?.['auth'] as never, action as never),
    todos: todosReducer(state?.['todos'] as never, action as never),
  });
}

function composeMetaReducers(
  reducers: MetaReducer[],
  baseReducer: ReturnType<typeof createRootReducer>
) {
  let composed = baseReducer as never;
  for (const meta of reducers) {
    composed = meta(composed) as never;
  }
  return composed as unknown as ReturnType<typeof createRootReducer>;
}

describe('store meta-reducers', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
  });

  it('rehydrates persisted auth fields on INIT', () => {
    storage['auth'] = JSON.stringify({
      token: 'saved-token',
      user: { id: 'u1', name: 'Saved', email: 's@e.com' },
      isLoggedIn: true,
    });

    const reducer = composeMetaReducers(
      [clearStateMetaReducer, localStorageSyncReducer, persistenceReadyMetaReducer],
      createRootReducer()
    );

    const state = reducer(undefined, { type: INIT });

    expect(state.auth).toMatchObject({
      token: 'saved-token',
      isLoggedIn: true,
      user: { id: 'u1', name: 'Saved', email: 's@e.com' },
    });
    expect(state.auth._persistedAt).toEqual(expect.any(Number));
  });

  it('persists auth slice after loginSuccess', () => {
    const reducer = composeMetaReducers(metaReducers, createRootReducer());
    let state = reducer(undefined, { type: INIT });

    state = reducer(
      state,
      loginSuccess({
        authResponse: {
          user: { id: 'u1', name: 'Test', email: 't@e.com' },
          accessToken: 'token-1',
        },
      })
    );

    expect(state.auth.token).toBe('token-1');

    const saved = JSON.parse(storage['auth'] ?? '{}');
    expect(saved).toEqual({
      token: 'token-1',
      user: { id: 'u1', name: 'Test', email: 't@e.com' },
      isLoggedIn: true,
    });
  });

  it('clears todos on logout via clearStateMetaReducer', () => {
    const reducer = composeMetaReducers(metaReducers, createRootReducer());
    let state = reducer(undefined, { type: INIT });

    state = reducer(
      state,
      loginSuccess({
        authResponse: {
          user: { id: 'u1', name: 'Test', email: 't@e.com' },
          accessToken: 'token-1',
        },
      })
    );
    state = reducer(
      state,
      TodoActions.loadTodosSuccess({
        todos: [{ id: '1', userId: 'u1', task: 'A', completed: false, tags: [], priority: 'medium' as const }],
      })
    );

    expect(state.todos.ids).toHaveLength(1);

    state = reducer(state, logoutUser());

    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
    expect(state.auth.isLoggedIn).toBe(false);
    expect(state.todos).toEqual(initialTodoState);
    expect(state.auth._persistedAt).toEqual(expect.any(Number));
  });
});
