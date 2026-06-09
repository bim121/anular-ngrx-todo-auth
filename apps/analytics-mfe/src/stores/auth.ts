import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { LoginDto } from '@shared/api-types/login.dto';
import { loginUser } from '@/core/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const userId = ref<string | null>(null);
  const userName = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
