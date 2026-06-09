import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const store = useAuthStore();
  const { token, userId, userName, loading, error } = storeToRefs(store);

  return {
    token,
    userId,
    userName,
    loading,
    error,
    isLoggedIn: computed(() => token.value != null),
    login: store.login,
    logout: store.logout,
  };
}
