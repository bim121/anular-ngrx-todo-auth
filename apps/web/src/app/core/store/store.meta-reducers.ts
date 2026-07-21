import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { logoutUser } from '@anular-ngrx/auth-data-access';
import { AuthStatus } from '@anular-ngrx/auth-data-access';

type RootState = Record<string, unknown>;

interface AuthPersistenceSlice {
  _persistedAt?: number | null;
  isLoggedIn?: boolean;
  status?: AuthStatus;
  token?: string | null;
}

export function localStorageSyncReducer(
  reducer: ActionReducer<RootState>,
): ActionReducer<RootState> {
  return localStorageSync({
    keys: [{ auth: ['token', 'user', 'isLoggedIn', 'status'] }],
    rehydrate: true,
    checkStorageAvailability: true,
  })(reducer);
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
      // `status` defaults to idle from the reducer; repair when a session was rehydrated.
      const status: AuthStatus =
        auth.status === 'authenticated' || auth.status === 'submitting' || auth.status === 'error'
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
