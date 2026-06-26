import type { LoginDto } from '@shared/api-types/login.dto';
import { API_BASE_URL } from './env';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Todo {
  id: string;
  userId: string;
  task: string;
  completed: boolean;
  createdAt?: string;
}

type StoredUser = AuthUser & { password: string };

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `${fallback} (${response.status})`;
  } catch {
    return `${fallback} (${response.status})`;
  }
}

export async function loginUser(dto: LoginDto): Promise<{
  user: AuthUser;
  accessToken: string;
}> {
  const params = new URLSearchParams({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
  });

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Login failed (${response.status})`);
  }

  const users = (await response.json()) as StoredUser[];

  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken: `mockToken=${user.id}-${Date.now()}`,
  };
}

/** json-server todos — Bearer required (same as Angular TodoService). */
export async function fetchTodos(
  userId: string,
  accessToken: string
): Promise<Todo[]> {
  const response = await fetch(
    `${API_BASE_URL}/todos?userId=${encodeURIComponent(userId)}`,
    { headers: authHeaders(accessToken) }
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load todos'));
  }

  return (await response.json()) as Todo[];
}

export async function createTodo(
  task: string,
  userId: string,
  accessToken: string
): Promise<Todo> {
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    userId,
    task,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(newTodo),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to add todo'));
  }

  return (await response.json()) as Todo;
}

export async function updateTodo(
  todo: Partial<Todo> & { id: string },
  userId: string,
  accessToken: string,
  options?: { mockToggleError?: boolean }
): Promise<Todo> {
  const headers: HeadersInit = {
    ...authHeaders(accessToken),
    ...(options?.mockToggleError ? { 'X-Mock-Toggle-Error': '1' } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to update todo'));
  }

  const updated = (await response.json()) as Todo;
  if (updated.userId !== userId) {
    throw new Error('Unauthorized to update this todo');
  }

  return updated;
}

export async function deleteTodo(
  todoId: string,
  userId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to delete todo'));
  }

  const removed = (await response.json()) as Todo;
  if (removed.userId !== userId) {
    throw new Error('Unauthorized to delete this todo');
  }
}
