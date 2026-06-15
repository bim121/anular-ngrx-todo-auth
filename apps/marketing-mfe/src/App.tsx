import { useState } from 'react';
import type { AuthResponse } from '@marketing/core/api';
import { LoginPage } from '@marketing/features/auth/login-page';
import { TodoList } from '@marketing/features/todos/TodoList';

export function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  if (!auth) {
    return <LoginPage onLoginSuccess={setAuth} />;
  }

  return (
    <TodoList
      userId={auth.user.id}
      accessToken={auth.accessToken}
      userName={auth.user.name}
      onLogout={() => setAuth(null)}
    />
  );
}
