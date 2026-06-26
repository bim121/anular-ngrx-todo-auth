import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from '@/core/api';
import { todoQueryKey } from '@/core/query-client';
import { useAuthStore } from '@/stores/auth';

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
  const auth = useAuthStore();
  const { userId, token } = storeToRefs(auth);

  return useQuery({
    queryKey: computed(() => todoQueryKey(userId.value ?? '')),
    queryFn: () => {
      const authContext = requireAuth(userId.value, token.value);
      return fetchTodos(authContext.userId, authContext.token);
    },
    enabled: computed(() => Boolean(userId.value && token.value)),
  });
}

export function useAddTodoMutation() {
  const queryClient = useQueryClient();
  const auth = useAuthStore();
  const { userId, token } = storeToRefs(auth);

  return useMutation({
    mutationFn: (task: string) => {
      const authContext = requireAuth(userId.value, token.value);
      return createTodo(task, authContext.userId, authContext.token);
    },
    onSuccess: () => {
      if (userId.value) {
        void queryClient.invalidateQueries({
          queryKey: todoQueryKey(userId.value),
        });
      }
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  const auth = useAuthStore();
  const { userId, token } = storeToRefs(auth);

  return useMutation({
    mutationFn: (todoId: string) => {
      const authContext = requireAuth(userId.value, token.value);
      return deleteTodo(todoId, authContext.userId, authContext.token);
    },
    onSuccess: () => {
      if (userId.value) {
        void queryClient.invalidateQueries({
          queryKey: todoQueryKey(userId.value),
        });
      }
    },
  });
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();
  const auth = useAuthStore();
  const { userId, token } = storeToRefs(auth);

  return useMutation({
    mutationFn: (todo: Todo) => {
      const authContext = requireAuth(userId.value, token.value);
      return updateTodo(
        { id: todo.id, completed: !todo.completed },
        authContext.userId,
        authContext.token,
        { mockToggleError: todo.task.startsWith('[500]') }
      );
    },
    onMutate: async (todo) => {
      const authContext = requireAuth(userId.value, token.value);
      const key = todoQueryKey(authContext.userId);
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
