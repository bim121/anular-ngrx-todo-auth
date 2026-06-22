import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { logoutUser } from '@app/features/auth/data-access/auth.actions';

type RootState = Record<string, unknown>;

export function localStorageSyncReducer(
  reducer: ActionReducer<RootState>
): ActionReducer<RootState> {
  return localStorageSync({
    keys: [{ auth: ['token', 'user', 'isLoggedIn'] }],
    rehydrate: true,
    checkStorageAvailability: true,
  })(reducer);
}

/** Clears entire root state on logout so todos/router slices reset too (plan 3.5.4). */
export function clearStateMetaReducer(
  reducer: ActionReducer<RootState>
): ActionReducer<RootState> {
  return (state, action) => {
    if (action.type === logoutUser.type) {
      state = undefined;
    }
    return reducer(state, action);
  };
}

/** Marks auth rehydrate complete so guards do not race persisted session (plan 3.5.3). */
export function persistenceReadyMetaReducer(
  reducer: ActionReducer<RootState>
): ActionReducer<RootState> {
  return (state, action) => {
    const nextState = reducer(state, action);
    const auth = nextState?.['auth'] as { _persistedAt?: number | null } | undefined;

    if (auth && auth._persistedAt == null) {
      return {
        ...nextState,
        auth: { ...auth, _persistedAt: Date.now() },
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
