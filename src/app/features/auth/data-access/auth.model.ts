export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    /** null until localStorage rehydrate completes; guards wait before reading auth (plan 3.5.3). */
    _persistedAt: number | null;
}