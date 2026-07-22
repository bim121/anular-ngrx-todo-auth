import { useAuthStore } from '@/stores/auth';
import { useTodosStore } from '@/stores/todos';

/** Clears auth session + todos client state (no Query cache anymore). */
export function useLogout() {
  const auth = useAuthStore();
  const todos = useTodosStore();

  return () => {
    auth.logout();
    todos.clear();
  };
}
