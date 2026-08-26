import { createAction, props } from "@ngrx/store";
import { User, AuthResponse } from './auth.model';

export const registerUser = createAction(
    '[Auth page] Register User',
    props<{credentials: {name: string; email: string; password: string}}>()
);

export const registerSuccess = createAction(
    '[Auth API] Register Success',
    props<{user: User}>()
);

export const registerFailure = createAction(
    '[Auth API] Register Failure',
    props<{ error: unknown }>()
);

export const loginUser = createAction(
    '[Login page] login user',
    props<{ credentials: {email: string; password: string}}>()
);

export const loginSuccess = createAction(
    '[Auth API] Login Success',
    props<{authResponse: AuthResponse}>()
)

export const loginFailure = createAction(
    '[Auth API] Login Failure',
    props<{error: unknown}>()
);

export const logoutUser = createAction(
    '[App Logout] Logout User'
);

/** SSR: restore session from httpOnly cookie before guards/resolvers (Phase 7.2.4). */
export const restoreAuthFromSession = createAction(
    '[SSR Session] Restore Auth From Session',
    props<{ user: User; token: string }>()
);