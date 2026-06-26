import { useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';

export function useLogout() {
  const queryClient = useQueryClient();
  const auth = useAuthStore();

  return () => {
    auth.logout();
    queryClient.clear();
  };
}
