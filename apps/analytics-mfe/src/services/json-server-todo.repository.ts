import type { InjectionKey } from 'vue';
import {
  JsonServerTodoRepository,
  type TodoRepository,
} from '@shared/data-access';
import { API_BASE_URL } from '@/core/env';
import { useAuthStore } from '@/stores/auth';

/** provide/inject token — swap MockTodoRepository in tests. */
export const TODO_REPOSITORY: InjectionKey<TodoRepository> =
  Symbol('TODO_REPOSITORY');

/** App default — json-server `:3000` with Bearer from Pinia auth. */
export function createJsonServerTodoRepository(): TodoRepository {
  return new JsonServerTodoRepository({
    baseUrl: API_BASE_URL,
    getAccessToken: () => useAuthStore().token,
    getUserId: () => useAuthStore().userId,
  });
}
