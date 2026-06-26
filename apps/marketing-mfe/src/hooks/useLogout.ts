import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@marketing/stores/authStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    queryClient.clear();
  };
}
