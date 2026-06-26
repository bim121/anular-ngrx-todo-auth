import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { LoginDto } from '@shared/api-types/login.dto';
import { loginUser } from '@/core/api';
import { useTodosStore } from './todos';

const STORAGE_KEYS = {
  token: 'analytics-mfe:token',
  userId: 'analytics-mfe:userId',
  userName: 'analytics-mfe:userName',
} as const;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore quota / private mode
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readStorage(STORAGE_KEYS.token));
  const userId = ref<string | null>(readStorage(STORAGE_KEYS.userId));
  const userName = ref<string | null>(readStorage(STORAGE_KEYS.userName));
  const loading = ref(false);
  const error = ref<string | null>(null);

  watch(token, (value) => writeStorage(STORAGE_KEYS.token, value));
  watch(userId, (value) => writeStorage(STORAGE_KEYS.userId, value));
  watch(userName, (value) => writeStorage(STORAGE_KEYS.userName, value));

  async function login(dto: LoginDto): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const auth = await loginUser(dto);
      token.value = auth.accessToken;
      userId.value = auth.user.id;
      userName.value = auth.user.name;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Try again.';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    token.value = null;
    userId.value = null;
    userName.value = null;
    error.value = null;
    useTodosStore().$reset();
  }

  return {
    token,
    userId,
    userName,
    loading,
    error,
    login,
    logout,
  };
});
