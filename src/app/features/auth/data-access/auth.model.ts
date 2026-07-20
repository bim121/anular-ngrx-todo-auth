export interface User {
    id: string;
    name: string;
    email: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

/** Explicit auth state machine (phase 4.4.1 variant B). */
export type AuthStatus = 'idle' | 'submitting' | 'authenticated' | 'error';

export interface AuthState {
    user: User | null;
    token: string | null;
    /** Single source of truth for the auth lifecycle machine. */
    status: AuthStatus;
    /** Kept in sync with `status` for persistence / existing selectors. */
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    /** null until localStorage rehydrate completes; guards wait before reading auth (plan 3.5.3). */
    _persistedAt: number | null;
}
