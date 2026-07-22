import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  JsonServerTodoRepository,
  type TodoRepository,
} from '@shared/data-access';
import { API_BASE_URL } from '@marketing/core/env';
import { useAuthStore } from '@marketing/stores/authStore';

const TodoRepositoryContext = createContext<TodoRepository | null>(null);

interface TodoRepositoryProviderProps {
  repository: TodoRepository;
  children: ReactNode;
}

/** Override the default JsonServerTodoRepository (e.g. MockTodoRepository in tests). */
export function TodoRepositoryProvider({
  repository,
  children,
}: TodoRepositoryProviderProps) {
  return (
    <TodoRepositoryContext.Provider value={repository}>
      {children}
    </TodoRepositoryContext.Provider>
  );
}

export function useTodoRepository(): TodoRepository {
  const injected = useContext(TodoRepositoryContext);
  const defaultRepo = useMemo(
    () =>
      new JsonServerTodoRepository({
        baseUrl: API_BASE_URL,
        getAccessToken: () => useAuthStore.getState().token,
        getUserId: () => useAuthStore.getState().userId,
      }),
    []
  );

  return injected ?? defaultRepo;
}
