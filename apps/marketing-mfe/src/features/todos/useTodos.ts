import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Todo } from '@shared/data-access';
import { todoQueryKey } from '@marketing/core/query-client';
import { useAuthStore } from '@marketing/stores/authStore';
import { useTodoRepository } from './todo-repository-context';

/**
 * Feature composable — pages/components import this only.
 * TanStack Query stays behind the hook; persistence goes through TodoRepository.
 */
export function useTodos() {
  const repo = useTodoRepository();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);
  const authenticated = Boolean(userId && token);

  const query = useQuery({
    queryKey: todoQueryKey(userId ?? ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('Not authenticated');
      }
      return repo.getAll(userId);
    },
    enabled: authenticated,
  });

  const addMutation = useMutation({
    mutationFn: (task: string) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }
      return repo.create({ task, userId });
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: todoQueryKey(userId) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (todoId: string) => repo.delete(todoId),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: todoQueryKey(userId) });
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (todo: Todo) =>
      repo.update({ ...todo, completed: !todo.completed }),
    onMutate: async (todo) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }
      const key = todoQueryKey(userId);
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

  const todos = query.data ?? [];
  const { mutateAsync: addAsync } = addMutation;
  const { mutateAsync: deleteAsync } = deleteMutation;
  const { mutateAsync: toggleAsync } = toggleMutation;

  const add = useCallback(
    (task: string) => addAsync(task),
    [addAsync]
  );

  const remove = useCallback(
    (id: string) => deleteAsync(id),
    [deleteAsync]
  );

  const toggle = useCallback(
    async (id: string) => {
      const todo = todos.find((item) => item.id === id);
      if (!todo) {
        throw new Error(`Todo not found: ${id}`);
      }
      return toggleAsync(todo);
    },
    [todos, toggleAsync]
  );

  return {
    todos,
    loading: query.isLoading,
    error: query.error,
    mutating:
      addMutation.isPending ||
      deleteMutation.isPending ||
      toggleMutation.isPending,
    add,
    toggle,
    remove,
  };
}
