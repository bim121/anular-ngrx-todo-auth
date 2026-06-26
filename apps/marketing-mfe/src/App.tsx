import { useAuthStore } from '@marketing/stores/authStore';
import { LoginPage } from '@marketing/features/auth/login-page';
import { TodoList } from '@marketing/features/todos/TodoList';

export function App() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <LoginPage />;
  }

  return <TodoList />;
}
