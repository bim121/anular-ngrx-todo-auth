import { ActionReducer, INIT, MetaReducer } from '@ngrx/store';
import { logoutUser } from '@anular-ngrx/auth-data-access';
import { AuthStatus } from '@anular-ngrx/auth-data-access';

type RootState = Record<string, unknown>;

interface AuthPersistenceSlice {
  _persistedAt?: number | null;
  isLoggedIn?: boolean;
  status?: AuthStatus;
  token?: string | null;
  user?: unknown;
}

const AUTH_STORAGE_KEY = 'auth';
const AUTH_PERSIST_KEYS = ['token', 'user', 'isLoggedIn', 'status'] as const;

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readPersistedAuth(): Partial<AuthPersistenceSlice> | null {
  if (!canUseStorage()) {
    return null;
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<AuthPersistenceSlice>;
  } catch {
    return null;
  }
}

function writePersistedAuth(auth: AuthPersistenceSlice): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    const payload: Record<string, unknown> = {};
    for (const key of AUTH_PERSIST_KEYS) {
      payload[key] = auth[key];
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

/**
 * Lightweight auth↔localStorage sync (replaces ngrx-store-localstorage + deepmerge).
 * Same storage shape: key `auth` with token/user/isLoggedIn/status.
 */
export function localStorageSyncReducer(
  reducer: ActionReducer<RootState>,
): ActionReducer<RootState> {
  return (state, action) => {
    let working = state;

    if (action.type === INIT && state === undefined) {
      const stored = readPersistedAuth();
      if (stored) {
        working = { auth: stored } as RootState;
      }
    }

    const nextState = reducer(working, action);
    const auth = nextState?.['auth'] as AuthPersistenceSlice | undefined;
    if (auth) {
      writePersistedAuth(auth);
    }

    return nextState;
  };
}

/** Clears entire root state on logout so todos/router slices reset too (plan 3.5.4). */
export function clearStateMetaReducer(reducer: ActionReducer<RootState>): ActionReducer<RootState> {
  return (state, action) => {
    if (action.type === logoutUser.type) {
      state = undefined;
    }
    return reducer(state, action);
  };
}

/**
 * Marks auth rehydrate complete so guards do not race persisted session (plan 3.5.3).
 * Also repairs `status` when older storage only had `isLoggedIn`.
 */
export function persistenceReadyMetaReducer(
  reducer: ActionReducer<RootState>,
): ActionReducer<RootState> {
  return (state, action) => {
    const nextState = reducer(state, action);
    const auth = nextState?.['auth'] as AuthPersistenceSlice | undefined;

    if (auth && auth._persistedAt == null) {
      const hasSession = !!(auth.isLoggedIn || auth.token);
      const status: AuthStatus =
        auth.status === 'authenticated' ||
        auth.status === 'submitting' ||
        auth.status === 'error'
          ? auth.status
          : hasSession
            ? 'authenticated'
            : 'idle';

      return {
        ...nextState,
        auth: {
          ...auth,
          status,
          isLoggedIn: status === 'authenticated',
          _persistedAt: Date.now(),
        },
      };
    }

    return nextState;
  };
}

/** Innermost first: clearState → localStorageSync → persistenceReady (outer). */
export const metaReducers: MetaReducer[] = [
  clearStateMetaReducer,
  localStorageSyncReducer,
  persistenceReadyMetaReducer,
];
