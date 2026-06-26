import { create } from 'zustand';
import type { AuthResponse } from '@marketing/core/api';

interface AuthState {
  token: string | null;
  userId: string | null;
  userName: string | null;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  userName: null,
  login: (auth) =>
    set({
      token: auth.accessToken,
      userId: auth.user.id,
      userName: auth.user.name,
    }),
  logout: () =>
    set({
      token: null,
      userId: null,
      userName: null,
    }),
}));
