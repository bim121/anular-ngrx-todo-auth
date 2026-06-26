import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from '@marketing/core/api';
import { todoQueryKey } from '@marketing/core/query-client';
import { useAuthStore } from '@marketing/stores/authStore';

function requireAuth(
  userId: string | null,
  token: string | null
): { userId: string; token: string } {
  if (!userId || !token) {
    throw new Error('Not authenticated');
  }
  return { userId, token };
}

export function useTodosQuery() {
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: todoQueryKey(userId ?? ''),
    queryFn: () => {
      const auth = requireAuth(userId, token);
      return fetchTodos(auth.userId, auth.token);
    },
    enabled: Boolean(userId && token),
  });
}

export function useAddTodoMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (task: string) => {
      const auth = requireAuth(userId, token);
      return createTodo(task, auth.userId, auth.token);
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: todoQueryKey(userId) });
      }
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (todoId: string) => {
      const auth = requireAuth(userId, token);
      return deleteTodo(todoId, auth.userId, auth.token);
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: todoQueryKey(userId) });
      }
    },
  });
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (todo: Todo) => {
      const auth = requireAuth(userId, token);
      return updateTodo(
        { id: todo.id, completed: !todo.completed },
        auth.userId,
        auth.token,
        { mockToggleError: todo.task.startsWith('[500]') }
      );
    },
    onMutate: async (todo) => {
      const auth = requireAuth(userId, token);
      const key = todoQueryKey(auth.userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Todo[]>(key);

      queryClient.setQueryData<Todo[]>(key, (current = []) =>
        current.map((item) =>
          item.id === todo.id
            ? { ...item, completed: !item.completed }
            : item
        )
      );

      return { previous, key };
    },
    onError: (_error, _todo, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _error, _todo, context) => {
      if (context?.key) {
        void queryClient.invalidateQueries({ queryKey: context.key });
      }
    },
  });
}
