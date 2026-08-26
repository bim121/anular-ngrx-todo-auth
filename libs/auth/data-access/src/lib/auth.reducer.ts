import { createReducer, on } from "@ngrx/store";
import { AuthState, AuthStatus } from './auth.model';
import * as AuthActions from "./auth.actions";

export const authFeatureKey = "auth";

export const initialState: AuthState = {
    user: null,
    token: null,
    status: 'idle',
    isLoggedIn: false,
    isLoading: false,
    error: null,
    _persistedAt: null,
};

function withStatus(
    state: AuthState,
    status: AuthStatus,
    patch: Partial<AuthState> = {}
): AuthState {
    return {
        ...state,
        status,
        isLoading: status === 'submitting',
        isLoggedIn: status === 'authenticated',
        ...patch,
    };
}

export const authReducer = createReducer(
    initialState,

    on(AuthActions.registerUser, (state) =>
        withStatus(state, 'submitting', { error: null })
    ),

    on(AuthActions.registerSuccess, (state) =>
        withStatus(state, 'idle', { error: null })
    ),

    on(AuthActions.registerFailure, (state, {error}) =>
        withStatus(state, 'error', {
            error: error instanceof Error ? error.message : 'Registration failed',
        })
    ),

    on(AuthActions.loginUser, (state) =>
        withStatus(state, 'submitting', { error: null })
    ),

    on(AuthActions.loginSuccess, (state, {authResponse}) =>
        withStatus(state, 'authenticated', {
            user: authResponse.user,
            token: authResponse.accessToken,
            error: null,
        })
    ),

    on(AuthActions.restoreAuthFromSession, (state, { user, token }) =>
        withStatus(state, 'authenticated', {
            user,
            token,
            error: null,
            _persistedAt: Date.now(),
        })
    ),

    on(AuthActions.loginFailure, (state, {error}) =>
        withStatus(state, 'error', {
            user: null,
            token: null,
            error: error instanceof Error ? error.message : 'Login failed',
        })
    ),

    on(AuthActions.logoutUser, () => ({
        ...initialState
    }))
)
